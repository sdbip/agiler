import { ItemDTO } from '../../backend/src/dtos/item-dto'
import { ClassName, Selector } from './class-name'
import { delay } from './delay'
import { DOMElement } from './dom-element'
import { render } from './Templates'

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

  private get spinnerElement() {
    return this.getElement({ className:{ name: 'spinner' } })
  }

  static forId(id: string) {
    const element = DOMElement.single({ id: `item-${id}` })
    return element && new ItemComponent(element)
  }
  private constructor(readonly element: DOMElement) { }

  private getElement(selector: Selector) {
    return DOMElement.single(selector, this.element) as DOMElement
  }

  async replaceChildItems(items: ItemDTO[]) {
    const html = await render('subtasks', { items })
    this.itemListElement.setInnerHTML(html)
    await delay(500)

    for (const element of this.itemListElement.decendants({ className: ClassName.hidden }))
      element.removeClass(ClassName.hidden)
  }

  async activateSpinnerDuring(runIt: () => Promise<void>) {
    this.spinnerElement.removeClass(ClassName.inactive)

    try {
      await runIt()
    } finally {
      this.spinnerElement.addClass(ClassName.inactive)
    }
  }
}

const getParentItemElement = (element: DOMElement): DOMElement | null => {
  const parent = element?.parentElement
  if (!parent) return null
  if (parent.id.startsWith('item-') &&
    !parent.id.startsWith('item-list')) return parent
  return getParentItemElement(parent)
}
