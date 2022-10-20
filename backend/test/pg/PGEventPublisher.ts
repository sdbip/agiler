import { EventPublisher } from '../../src/backend'
import { Event } from '../../src/domain/event'
import { PGDatabase } from '../../src/pg/pg-database'

export class PGEventPublisher implements EventPublisher {
  async publish(entityId: string, entityType: string, events: Event[]) {
    await this.database.query('INSERT INTO Entities VALUES ($1, $2, $3)',
    [
      entityId,
      entityType,
      0,
    ])

    for (const event of events)
      await this.database.query('INSERT INTO Events VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [
          entityId,
          entityType,
          event.name,
          JSON.stringify(event.details),
          '', 0, 0, 0,
        ])
  }

  constructor(readonly database: PGDatabase) {
    this.database = database
  }
}
