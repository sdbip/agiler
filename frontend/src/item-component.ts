import { DOMElement } from './dom-element'

export class ItemComponent {

  get parentComponent() {
    const parentElement = getParentItemElement(this.element)
    return parentElement && new ItemComponent(parentElement)
  }

  get itemId() {
    return this.element.id.replace('item-', '')
  }

  get title() { return this.titleInputElement?.inputElementValue }

  get titleInputElement() {
    return this.getElement('.item-title')
  }
  get addButtonElement() {
    return this.getElement('.add-button')
  }
  get collapsible() {
    return this.getElement('.collapsible')
  }

  get itemListElement() {
    return this.getElement('.item-list')
  }

  get spinnerElement() {
    return this.getElement('.spinner')
  }

  static forId(id: string) {
    const element = DOMElement.single(`#item-${id}`)
    return element && new ItemComponent(element)
  }
  private constructor(readonly element: DOMElement) { }

  private getElement(selector: string) {
    return DOMElement.single(selector, this.element)
  }
}

const getParentItemElement = (element: DOMElement): DOMElement | null => {
  const parent = element?.parentElement
  if (!parent) return null
  if (parent.id.startsWith('item-') &&
    !parent.id.startsWith('item-list')) return parent
  return getParentItemElement(parent)
}
