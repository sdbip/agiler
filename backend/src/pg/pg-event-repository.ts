import { EntityHistory, EntityVersion, Event, EventRepository } from '../es/index.js'
import { PGDatabase } from './pg-database'

export class PGEventRepository implements EventRepository {
  private readonly database: PGDatabase

  constructor(database: PGDatabase) {
    this.database = database
  }

  async getHistoryFor(entityId: string) {
    const version = await this.getVersionFor(entityId)
    if (version === null) return null

    const events = await this.getEvents(entityId)
    return new EntityHistory(version, events)
  }

  private async getVersionFor(entityId: string) {
    const result = await this.database.query(
      'SELECT version FROM Entities WHERE id = $1',
      [ entityId ])
    if (result.rowCount === 0) return null
    return EntityVersion.of(result.rows[0].version)
  }

  private async getEvents(entityId: string) {
    const result = await this.database.query(
      'SELECT * FROM Events WHERE entity_id = $1',
      [ entityId ])

    return result.rows.map(r => new Event(r.name, JSON.parse(r.details)))
  }
}
