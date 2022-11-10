import { ClassName } from '../class-name'
import { delay } from '../delay'
import { DOMElement } from '../dom-element'
import { render } from '../Templates'

export class ItemListTransition {
  private get itemElements() { return this.itemListElement.children }

  get obsoleteElements() {
    return this.itemElements
      .filter(element =>
        this.items.every(i => i.id !== this.getItemId(element)))
  }

  get taggedItems() {
    const existingIds = this.itemElements.map(this.getItemId)
    return this.items.map(i => ({ ...i, isNew: existingIds.indexOf(i.id) < 0 }))
  }
  constructor(
    readonly itemListElement: DOMElement,
    readonly items: {id: string}[],
  ) { }

  async replaceChildItems() {
    const obsoleteElements = this.obsoleteElements

    for (const element of obsoleteElements) element.addClass(ClassName.hidden)
    await delay(500)

    this.itemListElement.setInnerHTML(await render('item-list', {
      items: this.taggedItems,
      canComplete: () => function (this: any, text: string, render: any) {
        return this.type === 'Task' ? render(text) : ''
      },
      canPromote: () => function (this: any, text: string, render: any) {
        return this.type === 'Task' ? render(text) : ''
      },
      hasChildren: () => function (this: any, text: string, render: any) {
        return this.type !== 'Task' ? render(text) : ''
      },
    }))
    await delay(1)

    for (const html of this.itemListElement.decendants({ className: ClassName.hidden }))
      html.removeClass(ClassName.hidden)
  }

  private getItemId(element: DOMElement) {
    return element.id.replace('item-', '')
  }
}
