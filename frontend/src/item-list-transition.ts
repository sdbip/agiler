export class ItemListTransition<T extends Element> {
  get obsoleteElements() {
    return this.itemElements.filter(el => this.isObsolete(el))
  }

  get taggedItems() {
    const existingIds = this.itemElements.map(el => this.getItemId(el))
    return this.items.map(i => this.isNew(i, existingIds))
  }

  constructor(readonly itemElements: T[], readonly items: { id: string; }[]) { }

  private isNew(i: { id: string; }, existingIds: string[]): { isNew: boolean; id: string; } {
    return { ...i, isNew: existingIds.indexOf(i.id) < 0 }
  }

  private isObsolete(el: T) {
    return this.items.every(i => i.id !== this.getItemId(el))
  }

  private getItemId(el: T) {
    return el.id.replace('item-', '')
  }
}
