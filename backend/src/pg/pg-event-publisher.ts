import { Entity, EntityId, Event, EventPublisher } from '../es/source'
import { PGDatabase } from './pg-database'

export class PGEventPublisher implements EventPublisher {

  constructor(readonly database: PGDatabase) {
    this.database = database
  }

  async publishChanges(entity: Entity) {
    await this.database.transaction(async () => {
      const storedVersion = await this.getVersion(entity.id)
      if (storedVersion === null)
        await this.insertEntity(entity.entityId)

      let version = storedVersion ?? 0
      for (const event of entity.unpublishedEvents)
        await this.insertEvent(event, entity.entityId, version++)

      await this.setEntityVersion(entity.id, version)
      return true
    })
  }

  private async getVersion(entityId: string) {
    const result = await this.database.query('SELECT version FROM Entities WHERE id = $1', [ entityId ])
    return result.rows[0]?.version ?? null
  }

  private async insertEntity(entity: EntityId) {
    await this.database.query('INSERT INTO Entities VALUES ($1, $2, $3)',
      [
        entity.id,
        entity.type,
        0,
      ])
  }

  private async insertEvent(event: Event, entity: EntityId, version: number) {
    const actor = ''
    const timestamp = 0
    const position = 0
    await this.database.query('INSERT INTO Events VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [
        entity.id,
        entity.type,
        event.name,
        JSON.stringify(event.details),
        actor,
        timestamp,
        version,
        position,
      ])
  }

  private async setEntityVersion(id: string, version: number) {
    await this.database.query(
      'UPDATE Entities SET version = $2 WHERE id = $1',
      [ id, version ])
  }
}
