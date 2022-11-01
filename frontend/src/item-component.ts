import { DOMElement } from './dom-element'

export class PageComponent {
  static instance = new PageComponent()

  get title() { return this.titleInputElement?.inputElementValue }
  get addButtonElement() {
    return DOMElement.single('#add-button')
  }

  get titleInputElement() {
    return DOMElement.single('#item-title')
  }

  private constructor() { /**/ }
}

export class ItemComponent {
  get title() { return this.titleInputElement?.inputElementValue }

  get titleInputElement() {
    return DOMElement.single('.item-title', this.element)
  }
  get addButtonElement() {
    return DOMElement.single('.add-button', this.element)
  }

  static forId(id: string) {
    const element = DOMElement.single(`#item-${id}`)
    return element && new ItemComponent(element)
  }
  private constructor(readonly element: DOMElement) { }
}
