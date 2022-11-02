import { ItemDTO } from '../../backend/src/dtos/item-dto'
import { ClassName, Selector } from './class-name'
import { DOMElement } from './dom-element'
import { ItemListTransition } from './item-list-transition'
import { UIEventArgs } from './ui-event-args'


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

  handleUIEvent(name: string, _: UIEventArgs) {
    switch (name) {
      case 'focus':
      case 'input': {
        const button = this.addButtonElement
        if (!button) return

        const inputElement = this.titleInputElement
        if (inputElement?.inputElementValue)
          button.addClass(ClassName.default)
        else
          button.removeClass(ClassName.default)
        break
      }
      case 'blur': {
        const button = this.addButtonElement
        if (button) button.removeClass(ClassName.default)
      }
    }
  }
}
