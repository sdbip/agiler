import { Entity, EntityHistory, Event, EventPublisher, EventRepository } from '../../src/es'

export class InMemEventStore implements EventRepository, EventPublisher {
  entityTypes: {[id: string]: string} = {}
  events: {[id: string]: Event[]} = {}

  async getHistoryFor(entityId: string) {
    return this.entityTypes[entityId]
      ? new EntityHistory(this.events[entityId])
      : null
  }

  async publishChanges(entity: Entity): Promise<void> {
    this.entityTypes[entity.id] = entity.type
    this.events[entity.id] = [ ...this.events[entity.id] ?? [], ...entity.unpublishedEvents ]
  }
}
