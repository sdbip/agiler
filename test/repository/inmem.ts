import { TaskRepository } from '../../src/backend'
import { Progress, Task } from '../../src/domain/task'

class InMem implements TaskRepository {
  items: {[id: string]: Task} = {}
  
  async getNew() { return Object.values(this.items).filter(t => t.progress !== Progress.completed) }
  async get(id: string) {
    return this.items[id]
  }
  async add(task: any) { this.items[task.id] = task }
}

export default InMem
