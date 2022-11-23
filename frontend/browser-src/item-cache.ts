import { ItemDTO, ItemType, Progress } from './backend/dtos'

type Handler = (items: ItemDTO[]) => void

export interface ReadModel {
  fetchItem(id: string): Promise<ItemDTO | undefined>
  fetchItems(parentId: string | undefined, types: ItemType[]): Promise<ItemDTO[]>
}

export interface WriteModel {
  addItem(title: string, type: ItemType, parentId: string | undefined): Promise<{ id: string }>
  promoteTask(id: string): Promise<void>
  completeTask(id: string): Promise<void>
}

export enum ItemCacheEvent {
  ItemsAdded = 'items_added',
  ItemsRemoved = 'items_removed',
  ItemsChanged = 'items_changed',
}

export class ItemCache {
  private handlers: { [_ in ItemCacheEvent]?: Handler[] } = {}
  private itemsByParent: { [id: string]: ItemDTO[] } = {}

  constructor(private readonly readModel: ReadModel, private readonly writeModel: WriteModel) { }

  async fetchItems(storyId: string | undefined, types: ItemType[]) {
    const items = await this.readModel.fetchItems(storyId, types)
    this.update(storyId, items)
    return items
  }

  addItem(item: ItemDTO) {
    const items = this.getItems(item.parentId)
    if (items) items.push(item)
    else this.setItems(item.parentId, [ item ])
  }

  async postItem(type: ItemType, title: string, parentId?: string) {
    const response = await this.writeModel.addItem('', ItemType.Story, 'parent')
    const item: ItemDTO = {
      id: response.id,
      progress: Progress.notStarted,
      title,
      type: ItemType.Task,
    }
    this.notify(ItemCacheEvent.ItemsAdded, [ item ])

    const parent = Object.values(this.itemsByParent).flat().find(i => i.id === parentId)
    if (parent) (parent as any).type = ItemType.Epic // TODO: This is a hack. Replace it instead?
    this.notify(ItemCacheEvent.ItemsChanged, [ parent! ])
  }

  private update(parentId: string | undefined, items: ItemDTO[]) {
    const knownItems = this.getItems(parentId) ?? []
    this.setItems(parentId, items)

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

  private getItems(parentId: string | undefined): ItemDTO[] | undefined {
    return this.itemsByParent[parentId ?? '$null']
  }

  private setItems(parentId: string | undefined, items: ItemDTO[]) {
    this.itemsByParent[parentId ?? '$null'] = items
  }
}
