import { EventPublisher, ItemRepository } from '../../src/backend'
import { Progress, Item, ItemType, TaskState } from '../../src/domain/item'
import { Event } from '../../src/domain/event'

export class InMem implements ItemRepository, EventPublisher {
  events: {[id: string]: Event[]} = {}
  items: {[id: string]: [ItemType, TaskState]} = {}

  async itemsWithProgress(progress: Progress) {
    return Object.entries(this.items)
      .filter(([ , [ , state ] ]) => state.progress === progress)
      .map(([ id, [ type, state ] ]) => Item.fromState(id, type, { ...state }))
    }
  async get(id: string) {
    const item = this.items[id]
    return item && Item.fromState(id, item[0], { ...item[1] })
  }
  async add(item: Item) { this.items[item.id] = [ item.type, { ...item.state } ]}
  async update(item: Item) { this.items[item.id] = [ item.type, { ...item.state } ]}
  async publish(entityId: string, entityType: string, events: Event[]) {
    this.events[entityId] = [ ...this.events[entityId] ?? [], ...events ]
  }
}
