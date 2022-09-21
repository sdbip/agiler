import { TaskRepository } from '../../src/backend'
import { Progress, Task, TaskState } from '../../src/domain/task'

class InMem implements TaskRepository {
  items: {[id: string]: TaskState} = {}

  async allWithProgress(progress: Progress) {
    return Object.entries(this.items)
      .filter(([ , state ]) => state.progress === progress)
      .map(([ id, state ]) => Task.reconstitute(id, { ...state }))
    }
  async get(id: string) {
    const state = this.items[id]
    return state && Task.reconstitute(id, { ...state })
  }
  async add(task: Task) { this.items[task.id] = { ...task.state } }
  async update(task: Task) { this.items[task.id] = { ...task.state } }
}

export default InMem
