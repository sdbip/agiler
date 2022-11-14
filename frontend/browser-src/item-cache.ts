import { ItemDTO } from '../../backend/src/dtos/item-dto'

type Handler = (items: ItemDTO[]) => void

export enum ItemCacheEvent {
  ItemsAdded = 'items_added',
  ItemsRemoved = 'items_removed',
  ItemsChanged = 'items_changed',
}

export class ItemCache {
  private handlers: { [_ in ItemCacheEvent]?: Handler[] } = {}
  private rootItems: ItemDTO[] = []
  private itemsByParent: { [id:string]: ItemDTO[] } = {}

  update(parentId: string | undefined, items: ItemDTO[]) {
    const knownItems = parentId
      ? this.itemsByParent[parentId] ?? []
      : this.rootItems
    if (parentId) this.itemsByParent[parentId] = items
    else this.rootItems = items

    const addedItems = items.filter(i1 => !knownItems.find(i2 => i1.id === i2.id))
    const removedItems = knownItems.filter(i => items.findIndex(i2 => i2.id === i.id) < 0)
    const changedItems = items.filter(i1 => {
      const existing = knownItems.find(i2 => i1.id === i2.id)
      return existing && (existing.title !== i1.title)
    })

    this.notify(ItemCacheEvent.ItemsAdded, addedItems)
    this.notify(ItemCacheEvent.ItemsRemoved, removedItems)
    this.notify(ItemCacheEvent.ItemsChanged, changedItems)
  }

  on(event: ItemCacheEvent, handler: (items: ItemDTO[]) => void) {
    const handlers = this.handlers[event]
      ?? (this.handlers[event] = [])
    handlers.push(handler)
  }

  private notify(event: ItemCacheEvent, items: ItemDTO[]) {
    const handlers = this.handlers[event]
    if (!handlers || items.length === 0) return

    for (const handler of handlers)
      handler(items)
  }
}
