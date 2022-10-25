import { Event, EventProjection } from './es/projection.js'
import { Entity } from './es/source'

export class ImmediateSyncSystem {
  constructor(readonly projection: EventProjection) { }

  async sync(entity: Entity) {
    const convertUnpublishedEvents = (entity: Entity) =>
      entity.unpublishedEvents.map(e => new Event(entity.entityId, e.name, JSON.stringify(e.details)))
    const events = convertUnpublishedEvents(entity)
    await this.projection.project(events)
  }
}
