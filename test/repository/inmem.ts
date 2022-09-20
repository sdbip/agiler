import { TaskRepository } from '../../src/backend'
import { Task } from '../../src/domain/task'

class InMem implements TaskRepository {
  items: Task[] = []
  
  async getAll() { return this.items }
  async get(id: string) {
    return this.items.find(t => t.id === id)
  }
  async add(task: any) { this.items.push(task) }
}

export default InMem
