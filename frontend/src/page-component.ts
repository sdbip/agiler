import { ItemDTO } from '../../backend/src/dtos/item-dto'
import { ClassName, Selector } from './class-name'
import { DOMElement } from './dom-element'
import { ItemListTransition } from './item-list-transition'

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

  async replaceChildItems(items: ItemDTO[]) {
    const itemListElement = this.itemListElement
    if (!itemListElement) return

    const transition = new ItemListTransition(itemListElement, items)
    await transition.replaceChildItems()
  }

  handleUIEvent(name: string) {
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
    }
  }

  private highlightAddButton() {
    const button = this.addButtonElement
    if (button) button.addClass(ClassName.default)
  }

  private unhighlightAddButton() {
    const button = this.addButtonElement
    if (button) button.removeClass(ClassName.default)
  }
}
