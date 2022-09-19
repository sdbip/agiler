import { TaskRepository } from './backend'

class InMem implements TaskRepository {
  items: any[] = []
  
  async getAll() { return this.items }
  async add(item: any) { this.items.push(item) }
}

export default InMem
