import { Entity, EntityId, Event, EventPublisher } from '../es/source'
import { PGDatabase } from './pg-database'

type EventMetadataInternal = {
  actor: string
  version: number
  position: number
}

export class PGEventPublisher implements EventPublisher {

  constructor(readonly database: PGDatabase) {
    this.database = database
  }

  async publishChanges(entity: Entity, actor: string) {
    await this.database.transaction(async () => {
      const storedVersion = await this.getVersionOf(entity.id)
      if (storedVersion === null)
        await this.insertEntity(entity.entityId)
      else if (storedVersion !== entity.version.value)
        throw new Error('Concurrent Update Detected')

      const priorPositionResult = await this.database.query('SELECT MAX(position) FROM Events')
      const position = priorPositionResult.rows[0].max !== null
        ? 1 + priorPositionResult.rows[0].max
        : 0
      let version = storedVersion ?? 0
      for (const event of entity.unpublishedEvents) {
        await this.insertEvent(event, entity.entityId, { version, position, actor })
        version++        
      }

      await this.setEntityVersion(entity.id, version)
      return true
    })
  }

  private async getVersionOf(entityId: string) {
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

  private async insertEvent(event: Event, entity: EntityId, metadata: EventMetadataInternal) {
    await this.database.query(
      'INSERT INTO Events ' +
      '(entity_id, entity_type, name, details, actor, version, position)' +
      'VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [
        entity.id,
        entity.type,
        event.name,
        JSON.stringify(event.details),
        metadata.actor,
        metadata.version,
        metadata.position,
      ])
  }

  private async setEntityVersion(id: string, version: number) {
    await this.database.query(
      'UPDATE Entities SET version = $2 WHERE id = $1',
      [ id, version ])
  }
}
