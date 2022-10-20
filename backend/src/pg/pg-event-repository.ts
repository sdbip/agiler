import { EventRepository } from '../es'
import { PGDatabase } from './pg-database'

export class PGEventRepository implements EventRepository {
  private readonly database: PGDatabase

  constructor(database: PGDatabase) {
    this.database = database
  }

  async getEvents(entityId: string) {
    const res = await this.database.query(
      'SELECT * FROM Events WHERE entity_id = $1',
      [ entityId ])
    return res.rows.map(r => ({
      name: r.name,
      details: JSON.parse(r.details),
    }))
  }
}
