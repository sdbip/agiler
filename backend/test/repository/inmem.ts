import { ItemRepository } from '../../src/backend'
import { Progress, Item, ItemType, TaskState } from '../../src/domain/item'

class InMem implements ItemRepository {
  items: {[id: string]: [ItemType, TaskState]} = {}

  async allWithProgress(progress: Progress) {
    return Object.entries(this.items)
      .filter(([ , [ , state ] ]) => state.progress === progress)
      .map(([ id, [ type, state ] ]) => Item.reconstitute(id, type, { ...state }))
    }
  async get(id: string) {
    const item = this.items[id]
    return item && Item.reconstitute(id, item[0], { ...item[1] })
  }
  async add(task: Item) { this.items[task.id] = [ task.type, { ...task.state } ]}
  async update(task: Item) { this.items[task.id] = [ task.type, { ...task.state } ]}
}

export default InMem
