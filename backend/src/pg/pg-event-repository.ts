import { EntityHistory, EventRepository } from '../es/source.js'
import { PGRepository } from './pg-repository.js'

export class PGEventRepository implements EventRepository {

  constructor(readonly repository: PGRepository) {}

  async getHistoryFor(entityId: string) {
    const version = await this.repository.getVersionOf(entityId)
    if (!version) return undefined

    const events = await this.repository.getEventsFor(entityId)
    return new EntityHistory(version, events)
  }
}
