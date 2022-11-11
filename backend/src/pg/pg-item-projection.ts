import { Event, EventProjection } from '../es/projection'
import { Progress } from '../dtos/item-dto.js'
import { PGDatabase } from './pg-database'
import { ItemEvent } from '../domain/item.js'

export class PGItemProjection implements EventProjection {
  private readonly database: PGDatabase

  constructor(database: PGDatabase) {
    this.database = database
  }

  async project(events: Event[]) {
    for (const event of events) {
      switch (event.name) {
        case ItemEvent.Created:
          await this.database.query(
            'INSERT INTO Items (id, title, progress, type) VALUES ($1, $2, $3, $4)',
            [ event.entity.id, event.details.title, Progress.notStarted, event.details.type ])
          break
        case ItemEvent.ProgressChanged:
          await this.database.query(
            'UPDATE Items SET progress = $2 WHERE id = $1',
            [ event.entity.id, event.details.progress ])
          break
        case ItemEvent.TypeChanged:
          await this.database.query(
            'UPDATE Items SET type = $2 WHERE id = $1',
            [ event.entity.id, event.details.type ])
          break
        case ItemEvent.AssigneeChanged:
          await this.database.query(
            'UPDATE Items SET assignee = $2 WHERE id = $1',
            [ event.entity.id, event.details.assignee ])
          break
        case ItemEvent.ParentChanged:
          await this.database.query(
            'UPDATE Items SET parent_id = $2 WHERE id = $1',
          [ event.entity.id, event.details.parent ])
        break
      }
    }
  }
}
