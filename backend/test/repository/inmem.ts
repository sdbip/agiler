import { ItemRepository } from '../../src/backend'
import { Progress, Item, ItemType, TaskState } from '../../src/domain/item'

class InMem implements ItemRepository {
  items: {[id: string]: [ItemType, TaskState]} = {}

  async tasksWithProgress(progress: Progress) {
    return Object.entries(this.items)
      .filter(([ , [ type, state ] ]) => type === ItemType.Task && state.progress === progress)
      .map(([ id, [ type, state ] ]) => Item.reconstitute(id, type, { ...state }))
    }
  async get(id: string) {
    const item = this.items[id]
    return item && Item.reconstitute(id, item[0], { ...item[1] })
  }
  async add(item: Item) { this.items[item.id] = [ item.type, { ...item.state } ]}
  async update(item: Item) { this.items[item.id] = [ item.type, { ...item.state } ]}
}

export default InMem
