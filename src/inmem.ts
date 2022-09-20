import { TaskRepository } from './backend'
import { Task } from './domain/task'

class InMem implements TaskRepository {
  items: Task[] = []
  
  async getAll() { return this.items }
  async add(task: any) { this.items.push(task) }
}

export default InMem
