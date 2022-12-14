import { ItemDTO } from './backend/dtos'
import { failFast } from '../../shared/src/failFast'
import { ClassName, Selector } from './class-name'
import { DOMElement } from './dom-element'
import { render } from './templates'

export class PageComponent {
  static instance = new PageComponent()

  readonly itemId = undefined

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

  async handleUIEvent(name: string, args: any) {
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
      case 'items_added':
        await this.addComponents(args.items)
        break
    }
  }

  private async addComponents(items: ItemDTO[]) {
    const listElement = failFast.unlessExists(this.itemListElement, 'list element')

    const html = await render('item-list', {
      items,
      isEpic: () => function (this: ItemDTO, text: string, render: any) {
        return this.type === 'Epic' ? render(text) : ''
      },
      canComplete: () => function (this: any, text: string, render: any) {
        return this.type === 'Task' ? render(text) : ''
      },
      canPromote: () => function (this: any, text: string, render: any) {
        return this.type === 'Task' ? render(text) : ''
      },
      hasChildren: () => function (this: any, text: string, render: any) {
        return this.type !== 'Task' ? render(text) : ''
      },
    })
    const newElements = DOMElement.fromHTML(`<div>${html}</div>`).children
    for (const element of newElements) listElement.add(element)

    for (const element of newElements) {
      element.remove()
      element.addClass(ClassName.hidden)
    }

    for (const element of newElements) {
      listElement.add(element)
      element.removeClass(ClassName.hidden)
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
