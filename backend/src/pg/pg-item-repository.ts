import { ItemRepository } from '../backend'
import { Event, EventProjection } from '../es/projection'
import { ItemDTO, Progress } from '../dtos/item-dto'
import { PGDatabase } from './pg-database'

export class PGItemRepository implements ItemRepository, EventProjection {
  private readonly database: PGDatabase

  constructor(database: PGDatabase) {
    this.database = database
  }

  async itemsWithProgress(progress: Progress) {
    const res = await this.database.query(
      'SELECT * FROM Items WHERE progress = $1',
      [ progress ])
    return res.rows
  }

  async project(events: Event[]) {
    for (const event of events) {
      switch (event.name) {
        case 'Created':
          await this.database.query(
            'INSERT INTO Items (id, title, progress, type) VALUES ($1, $2, $3, $4)',
            [ event.entity.id, event.details.title, Progress.notStarted, event.details.type ])
          break
        case 'ProgressChanged':
          await this.database.query(
            'UPDATE Items SET progress = $2 WHERE id = $1',
            [ event.entity.id, event.details.progress ])
          break
        case 'TypeChanged':
          await this.database.query(
            'UPDATE Items SET type = $2 WHERE id = $1',
            [ event.entity.id, event.details.type ])
          break
        case 'AssigneeChanged':
          await this.database.query(
            'UPDATE Items SET assignee = $2 WHERE id = $1',
            [ event.entity.id, event.details.assignee ])
          break
      }
    }
  }

  async get(id: string): Promise<ItemDTO | undefined> {
    const res = await this.database.query(
      'SELECT * FROM Items WHERE id = $1',
      [ id ])
    return res.rows[0]
  }

  async add(item: ItemDTO) {
    await this.database.query(
      'INSERT INTO Items (id, title, progress, type) VALUES ($1, $2, $3, $4)',
      [ item.id, item.title, item.progress, item.type ])
  }

  async update(item: ItemDTO) {
    await this.database.query(
      'UPDATE Items SET title = $2, progress = $3, type = $4 WHERE id = $1',
      [ item.id, item.title, item.progress, item.type ])
  }
}
