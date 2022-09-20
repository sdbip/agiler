import { TaskRepository } from '../../src/backend'
import { Task } from '../../src/domain/task'

class InMem implements TaskRepository {
  items: {[id: string]: Task} = {}
  
  async getAll() { return Object.values(this.items) }
  async get(id: string) {
    return this.items[id]
  }
  async add(task: any) { this.items[task.id] = task }
}

export default InMem
