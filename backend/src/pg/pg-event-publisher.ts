import { Event, EventPublisher } from '../es'
import { PGDatabase } from './pg-database'

export class PGEventPublisher implements EventPublisher {
  async publish(entityId: string, entityType: string, events: Event[]) {
    await this.database.transaction(async () => {
      if (!await this.exists(entityId))
        await this.insertEntity(entityId, entityType)

      for (const event of events)
        await this.insertEvent(entityId, entityType, event)
      return true
    })
  }

  constructor(readonly database: PGDatabase) {
    this.database = database
  }

  private async exists(entityId: string) {
    const count = await this.database.query('SELECT COUNT(*) FROM Entities WHERE id = $1', [ entityId ])
    return count.rows[0].count > 0
  }

  private async insertEntity(entityId: string, entityType: string) {
    await this.database.query('INSERT INTO Entities VALUES ($1, $2, $3)',
      [
        entityId,
        entityType,
        0,
      ])
  }

  private async insertEvent(entityId: string, entityType: string, event: Event) {
    await this.database.query('INSERT INTO Events VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [
        entityId,
        entityType,
        event.name,
        JSON.stringify(event.details),
        '', 0, 0, 0,
      ])
  }
}
