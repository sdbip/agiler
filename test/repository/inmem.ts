import { TaskRepository } from '../../src/backend'
import { Task } from '../../src/domain/task'

class InMem implements TaskRepository {
  items: {[id: string]: Task} = {}
  
  async getNew() { return Object.values(this.items).filter(t => !t.isCompleted) }
  async get(id: string) {
    return this.items[id]
  }
  async add(task: any) { this.items[task.id] = task }
}

export default InMem
