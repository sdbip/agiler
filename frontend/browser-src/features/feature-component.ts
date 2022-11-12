import { ItemDTO } from '../../../backend/src/dtos/item-dto'
import { failFast } from '../../../shared/src/failFast'
import { ClassName, Selector, toSelector } from '../class-name'
import { CollapsibleElement } from '../collapsible-dom-element'
import { DOMElement } from '../dom-element'
import { ItemListTransition } from './item-list-transition'
import { MeasureComponent } from '../measure-component'

export class FeatureComponent {

  get parentComponent() {
    const getComponent = (element: DOMElement | null): FeatureComponent | null => {
      if (!element) return null
      if (element.id.startsWith('item-') &&
        !element.id.startsWith('item-list')) return new FeatureComponent(element)
      return getComponent(element.parentElement)
    }

    return getComponent(this.element.parentElement)
  }

  get itemId() {
    return this.element.id.replace('item-', '')
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
    return element && new FeatureComponent(element)
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
      case 'items-fetched':
        await this.replaceChildItems(args.items)
        break
      case 'collapse':
        this.collapse()
        break
      case 'disclose':
        this.disclose()
        break
    }
  }

  async replaceChildItems(items: ItemDTO[]) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const transition = new ItemListTransition(this.itemListElement!, items)
    await transition.replaceChildItems()
    const intrinsicSize = MeasureComponent.instance.measure(getCollapsible(this).innerHTML)
    getCollapsible(this).setHeight(intrinsicSize.height)
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

function getCollapsible(storyComponent: FeatureComponent) {
  const element = CollapsibleElement.find({ className: { name: 'collapsible' } }, storyComponent.element)
  failFast.unless(element instanceof CollapsibleElement, `Collapsible element for story ${storyComponent.itemId} is missing`)
  return element as CollapsibleElement
}
