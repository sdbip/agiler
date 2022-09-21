import { TaskRepository } from '../../src/backend'
import { Progress, Task } from '../../src/domain/task'

class InMem implements TaskRepository {
  items: {[id: string]: Task} = {}

  async allWithProgress(progress: Progress) { return Object.values(this.items).filter(t => t.progress === progress) }
  async get(id: string) { return this.items[id] }
  async add(task: any) { this.items[task.id] = task }
}

export default InMem
