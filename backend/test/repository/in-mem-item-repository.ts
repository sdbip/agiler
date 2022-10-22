import { EventProjection, ItemRepository } from '../../src/backend'
import { Progress, ItemType, TaskState } from '../../src/domain/item'
import { ItemDTO } from '../../src/dtos/item-dto'
import { Event } from '../../src/es/source'

export class InMemItemRepository implements ItemRepository, EventProjection {
  items: { [id: string]: [ItemType, TaskState] } = {}

  async itemsWithProgress(progress: Progress): Promise<ItemDTO[]> {
    return Object.entries(this.items)
      .filter(([ , [ , state ] ]) => state.progress === progress)
      .map(([ id, [ type, state ] ]) => ({ id, type, ...state }))
  }
  
  async project(id: string, events: Event[]) {
    for (const event of events) {
      switch (event.name) {
        case 'Created':
          this.items[id] = [ event.details.type, { ...event.details } ]
          break
        case 'TypeChanged':
          if (!this.items[id]) return
          this.items[id][0] = event.details.type
          break
        case 'ProgressChanged':
          if (!this.items[id]) return
          this.items[id][1].progress = event.details.progress
          break
        case 'AssigneeChanged':
          if (!this.items[id]) return
          this.items[id][1].assignee = event.details.assignee
          break
      }
    }
  }
}
