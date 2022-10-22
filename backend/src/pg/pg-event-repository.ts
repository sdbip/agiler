import { EntityHistory, Event, EventRepository } from '../es/index.js'
import { PGDatabase } from './pg-database'

export class PGEventRepository implements EventRepository {
  private readonly database: PGDatabase

  constructor(database: PGDatabase) {
    this.database = database
  }

  async getHistoryFor(entityId: string) {
    const res = await this.database.query(
      'SELECT * FROM Events WHERE entity_id = $1',
      [ entityId ])
    if (res.rowCount === 0) return null

    const events = res.rows.map(r =>
      new Event(r.name, JSON.parse(r.details)))
    return new EntityHistory(events)
  }
}
