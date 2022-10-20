import { EventPublisher, ItemRepository } from '../../src/backend'
import { Progress, Item, ItemType, TaskState } from '../../src/domain/item'
import { UnpublishedEvent } from '../../src/domain/unpublished_event'

class InMem implements ItemRepository, EventPublisher {
  events: {[id: string]: UnpublishedEvent[]} = {}
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
  async publish(id: string, events: UnpublishedEvent[]) {
    this.events[id] = [ ...this.events[id] ?? [], ...events ]
  }
}

export default InMem
