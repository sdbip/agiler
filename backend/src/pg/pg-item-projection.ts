import { Event, EventProjection } from '../es/projection'
import { Progress } from '../dtos/item-dto.js'
import { PGDatabase } from './pg-database'

export class PGItemProjection implements EventProjection {
  private readonly database: PGDatabase

  constructor(database: PGDatabase) {
    this.database = database
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
}
