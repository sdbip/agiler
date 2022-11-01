import { DOMElement } from './dom-element'


export class PageComponent {
  static instance = new PageComponent()

  get title() { return this.titleInputElement?.inputElementValue }
  get addButtonElement() {
    return this.getElement('#add-button')
  }

  get titleInputElement() {
    return this.getElement('#item-title')
  }

  get itemListElement() {
    return this.getElement('#item-list')
  }

  private constructor() { /**/ }

  private getElement(selector: string) {
    return DOMElement.single(selector)
  }
}
