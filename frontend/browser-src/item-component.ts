import { ItemDTO } from './backend/dtos'
import { failFast } from '../../shared/src/failFast'
import { ClassName, Selector, toSelector } from './class-name'
import { CollapsibleElement } from './collapsible-dom-element'
import { DOMElement } from './dom-element'
import { MeasureComponent } from './measure-component'
import { delay } from './delay'
import { render } from './templates'

export class ItemComponent {

  get parentComponent() {
    const getComponent = (element: DOMElement | null): ItemComponent | null => {
      if (!element) return null
      if (element.id.startsWith('item-') &&
        !element.id.startsWith('item-list')) return new ItemComponent(element)
      return getComponent(element.parentElement)
    }

    return getComponent(this.element.parentElement)
  }

  get itemId() {
    return this.element.getData('id') as string
  }

  get title() { return this.titleInputElement?.inputElementValue }

  get isDisclosed() {
    return this.element.hasClass(ClassName.disclosed)
  }

  get titleInputElement() {
    return this.getElement({ className:{ name: 'item-title' } })
  }
  get addButtonElement() {
    return this.getElement({ className:{ name: 'add-button' } })
  }

  get itemListElement() {
    return this.getElement({ className:{ name: 'item-list' } })
  }

  static forId(id: string) {
    const element = DOMElement.single({ id: `item-${id}` })
    return element && new ItemComponent(element)
  }
  private constructor(readonly element: DOMElement) { }

  private getElement(selector: Selector) {
    return DOMElement.single(selector, this.element)
  }

  async stopSpinnerAfter(runIt: () => Promise<void>) {
    try {
      await runIt()
    } finally {
      this.stopSpinner()
    }
  }

  async handleUIEvent(name: string, args?: any) {
    switch (name) {
      case 'focus':
      case 'input':
        if (this.title)
          this.highlightAddButton()
        else
          this.unhighlightAddButton()
        break
      case 'blur':
        this.unhighlightAddButton()
        break
      case 'loading':
        this.startSpinner()
        break
      case 'loading-done':
        this.stopSpinner()
        break
      case 'items_added':
        await this.addComponents(args.items)
        break
      case 'item_changed':
        this.updateDetails(args)
        break
      case 'item_removed':
        this.element.addClass(ClassName.hidden)
        await delay(200)
        this.element.remove()
        break
      case 'collapse':
        this.collapse()
        break
      case 'disclose':
        this.disclose()
        break
    }
  }

  private updateDetails(args: any) {
    this.getElement({ className: { name: 'title' } })?.setInnerHTML(args.item.title)
    this.element.setData('type', args.item.type)
    this.element.setData('progress', args.item.progress)
  }

  private async addComponents(items: ItemDTO[]) {
    const listElement = failFast.unlessExists(this.itemListElement, 'should have a list element')

    const html = await render('item-list', {
      items,
      canComplete: () => function (this: any, text: string, render: any) {
        return this.type === 'Task' ? render(text) : ''
      },
    })
    const newElements = DOMElement.fromHTML(`<div>${html}</div>`).children
    for (const element of newElements) listElement.add(element)

    const collapsibleElement = getCollapsible(this)
    const height = MeasureComponent.instance.measure(collapsibleElement.innerHTML).height

    for (const element of newElements) {
      element.remove()
      element.addClass(ClassName.hidden)
    }

    for (const element of newElements) {
      listElement.add(element)
      element.removeClass(ClassName.hidden)
    }

    collapsibleElement.setHeight(height)
  }

  private collapse() {
    this.element.removeClass(ClassName.disclosed)
    getCollapsible(this).setHeight(0)
  }

  private disclose() {
    this.element.addClass(ClassName.disclosed)
    const intrinsicSize = MeasureComponent.instance.measure(getCollapsible(this).innerHTML)
    getCollapsible(this).setHeight(intrinsicSize.height)
  }

  private startSpinner() {
    const spinnerElement = this.getElement(toSelector('.spinner'))
    spinnerElement?.removeClass(ClassName.inactive)
  }

  stopSpinner() {
    const spinnerElement = this.getElement(toSelector('.spinner'))
    spinnerElement?.addClass(ClassName.inactive)
  }

  private highlightAddButton() {
    const buttonElement = this.addButtonElement
    buttonElement?.addClass(ClassName.default)
  }

  private unhighlightAddButton() {
    const buttonElement = this.addButtonElement
    buttonElement?.removeClass(ClassName.default)
  }
}

function getCollapsible(storyComponent: ItemComponent) {
  const element = CollapsibleElement.find({ className: { name: 'collapsible' } }, storyComponent.element)
  failFast.unless(element instanceof CollapsibleElement, `Collapsible element for story ${storyComponent.itemId} is missing`)
  return element as CollapsibleElement
}
