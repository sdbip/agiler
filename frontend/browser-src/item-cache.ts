import { ItemDTO } from '../../backend/src/dtos/item-dto'

type Handler = (items: ItemDTO[]) => void

export enum ItemCacheEvent {
  ItemsAdded = 'items_added',
  ItemsRemoved = 'items_removed',
  ItemsChanged = 'items_changed',
}

export class ItemCache {
  private handlers: { [_ in ItemCacheEvent]?: Handler[] } = {}
  private items: ItemDTO[] = []

  update(items: ItemDTO[]) {
    const addedItems = items.filter(i => !this.findItem(i.id))
    const removedItems = this.items.filter(i => items.findIndex(i2 => i2.id === i.id) < 0)
    const changedItems = items.filter(i => this.isChanged(i))
    this.items = items

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

  private isChanged(item: ItemDTO) {
    const existing = this.findItem(item.id)
    return existing && existing.title !== item.title
  }

  private findItem(id: string) {
    return this.items.find(i => i.id === id)
  }
}
