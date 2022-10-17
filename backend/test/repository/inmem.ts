import { ItemRepository } from '../../src/backend'
import { Progress, Item, TaskState } from '../../src/domain/item'

class InMem implements ItemRepository {
  items: {[id: string]: TaskState} = {}

  async allWithProgress(progress: Progress) {
    return Object.entries(this.items)
      .filter(([ , state ]) => state.progress === progress)
      .map(([ id, state ]) => Item.reconstitute(id, { ...state }))
    }
  async get(id: string) {
    const state = this.items[id]
    return state && Item.reconstitute(id, { ...state })
  }
  async add(task: Item) { this.items[task.id] = { ...task.state } }
  async update(task: Item) { this.items[task.id] = { ...task.state } }
}

export default InMem
