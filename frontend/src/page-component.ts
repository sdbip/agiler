import { Selector } from './class-name'
import { DOMElement } from './dom-element'


export class PageComponent {
  static instance = new PageComponent()

  get title() { return this.titleInputElement?.inputElementValue }
  get addButtonElement() {
    return this.getElement({ id: 'add-button' })
  }

  get titleInputElement() {
    return this.getElement({ id: 'item-title' })
  }

  get itemListElement() {
    return this.getElement({ id: 'item-list' })
  }

  private constructor() { /**/ }

  private getElement(selector: Selector) {
    return DOMElement.single(selector)
  }
}
