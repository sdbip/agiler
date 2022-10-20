import { ItemRepository } from '../../src/backend'
import { Event, EventPublisher, EventRepository } from '../../src/es'
import { Progress, Item, ItemType, TaskState } from '../../src/domain/item'
import { ItemDTO } from '../../src/dtos/item-dto'

export class InMem implements EventRepository, ItemRepository, EventPublisher {
  entityTypes: {[id: string]: string} = {}
  events: {[id: string]: Event[]} = {}
  items: {[id: string]: [ItemType, TaskState]} = {}

  async itemsWithProgress(progress: Progress): Promise<ItemDTO[]> {
    return Object.entries(this.items)
      .filter(([ , [ , state ] ]) => state.progress === progress)
      .map(([ id, [ type, state ] ]) => ({ id, type, ...state }))
  }
  async get(id: string) {
    const item = this.items[id]
    return item && Item.fromState(id, item[0], { ...item[1] })
  }
  async add(item: ItemDTO) { this.items[item.id] = [ item.type, { ...item } ]}
  async update(item: ItemDTO) { this.items[item.id] = [ item.type, { ...item } ]}

  async getEvents(entityId: string) {
    return this.events[entityId]
  }

  async publish(entityId: string, entityType: string, events: Event[]) {
    this.entityTypes[entityId] = entityType
    this.events[entityId] = [ ...this.events[entityId] ?? [], ...events ]
  }
}
