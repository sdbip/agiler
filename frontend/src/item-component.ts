import { DOMElement } from './dom-element'

export class ItemComponent {
  static page = new ItemComponent()

  get title() { return this.titleInputElement?.inputElementValue }

  get titleInputElement() {
    return this.element
      ? DOMElement.single('.item-title', this.element)
      : DOMElement.single('#item-title')
  }

  static forId(id: string) {
    const element = DOMElement.single(`#item-${id}`)
    return element && new ItemComponent(element)
  }
  constructor(readonly element?: DOMElement) { }
}
