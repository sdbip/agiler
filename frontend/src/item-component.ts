import { ItemDTO } from '../../backend/src/dtos/item-dto'
import { ClassName, Selector, toSelector } from './class-name'
import { DOMElement } from './dom-element'
import { ItemListTransition } from './item-list-transition'

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
    return this.element.id.replace('item-', '')
  }

  get title() { return this.titleInputElement?.inputElementValue }

  get titleInputElement() {
    return this.getElement({ className:{ name: 'item-title' } })
  }
  get addButtonElement() {
    return this.getElement({ className:{ name: 'add-button' } })
  }
  get collapsible() {
    return this.getElement({ className:{ name: 'collapsible' } })
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

  handleUIEvent(name: string, args?: any) {
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
        this.replaceChildItems(args.items)
        break
    }
  }

  async replaceChildItems(items: ItemDTO[]) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const transition = new ItemListTransition(this.itemListElement!, items)
    await transition.replaceChildItems()
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
