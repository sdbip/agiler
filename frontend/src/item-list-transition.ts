import { DOMElement } from './dom-element'

export class ItemListTransition {
  get obsoleteElements() {
    return this.itemElements.filter(el => this.isObsolete(el))
  }

  get taggedItems() {
    const existingIds = this.itemElements.map(el => this.getItemId(el))
    return this.items.map(i => this.isNew(i, existingIds))
  }

  constructor(readonly itemElements: DOMElement[], readonly items: { id: string; }[]) { }

  private isNew(i: { id: string; }, existingIds: string[]): { isNew: boolean; id: string; } {
    return { ...i, isNew: existingIds.indexOf(i.id) < 0 }
  }

  private isObsolete(el: DOMElement) {
    return this.items.every(i => i.id !== this.getItemId(el))
  }

  private getItemId(el: DOMElement) {
    return el.id.replace('item-', '')
  }
}
