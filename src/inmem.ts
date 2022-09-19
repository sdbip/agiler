import { TaskRepository } from './backend'
import { Task } from './domain/task'

class InMem implements TaskRepository {
  items: {title:string}[] = []
  
  async getAll() { return this.items.map(i => new Task(i.title)) }
  async add(item: any) { this.items.push({ title:item.title }) }
}

export default InMem
