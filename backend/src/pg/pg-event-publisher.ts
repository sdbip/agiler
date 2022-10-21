import { EntityId, Event, EventPublisher } from '../es'
import { PGDatabase } from './pg-database'

export class PGEventPublisher implements EventPublisher {

  constructor(readonly database: PGDatabase) {
    this.database = database
  }

  async publish(events: Event[], entity: EntityId) {
    await this.database.transaction(async () => {
      if (!await this.exists(entity.id))
        await this.insertEntity(entity)

      for (const event of events)
        await this.insertEvent(event, entity)
      return true
    })
  }

  private async exists(entityId: string) {
    const count = await this.database.query('SELECT COUNT(*) FROM Entities WHERE id = $1', [ entityId ])
    return count.rows[0].count > 0
  }

  private async insertEntity(entity: EntityId) {
    await this.database.query('INSERT INTO Entities VALUES ($1, $2, $3)',
      [
        entity.id,
        entity.type,
        0,
      ])
  }

  private async insertEvent(event: Event, entity: EntityId) {
    await this.database.query('INSERT INTO Events VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [
        entity.id,
        entity.type,
        event.name,
        JSON.stringify(event.details),
        '', 0, 0, 0,
      ])
  }
}
