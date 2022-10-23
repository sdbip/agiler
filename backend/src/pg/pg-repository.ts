import { CanonicalEntityId, EntityVersion, PublishedEvent, UnpublishedEvent } from '../es/source.js'
import { PGDatabase } from './pg-database'

export class PGRepository {
  constructor(readonly database: PGDatabase) {}

  async getCurrentPosition() {
    const priorPositionResult = await this.database.query('SELECT MAX(position) FROM Events')
    return priorPositionResult.rows[0].max ?? undefined
  }

  async getVersionOf(entityId: string) {
    const result = await this.database.query('SELECT version FROM Entities WHERE id = $1', [ entityId ])
    if (!result.rows[0]) return undefined
    return EntityVersion.of(result.rows[0].version)
  }

  async setEntityVersion(entityId: string, version: EntityVersion) {
    await this.database.query(
      'UPDATE Entities SET version = $2 WHERE id = $1',
      [ entityId, version.value ])
  }

  async getEventsFor(entityId: string) {
    const result = await this.database.query(
      'SELECT * FROM Events WHERE entity_id = $1',
      [ entityId ])

    return result.rows.map(r => new PublishedEvent(r.name, r.details))
  }

  async insertEntity(entity: CanonicalEntityId, version: EntityVersion) {
    await this.database.query('INSERT INTO Entities VALUES ($1, $2, $3)',
      [
        entity.id,
        entity.type,
        version.value,
      ])
  }

  async insertEvent(event: UnpublishedEvent, entity: CanonicalEntityId, metadata: EventMetadataInternal) {
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
        metadata.version.value,
        metadata.position,
      ])
  }
}

type EventMetadataInternal = {
  actor: string
  version: EntityVersion
  position: number
}
