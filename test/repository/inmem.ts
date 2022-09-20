import { TaskRepository } from '../../src/backend'
import { Task } from '../../src/domain/task'

class InMem implements TaskRepository {
  items: Task[] = []
  
  async getAll() { return this.items }
  async add(task: any) { this.items.push(task) }
}

export default InMem
