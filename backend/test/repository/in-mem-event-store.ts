import { Entity, EntityHistory, Event, EventPublisher, EventRepository } from '../../src/es'

export class InMemEventStore implements EventRepository, EventPublisher {
  entityTypes: {[id: string]: string} = {}
  events: {[id: string]: Event[]} = {}

  async getEvents(entityId: string) {
    return this.events[entityId]
  }

  async getHistoryFor(entityId: string) {
    return new EntityHistory(await this.getEvents(entityId))
  }

  async publishChanges(entity: Entity): Promise<void> {
    this.entityTypes[entity.id] = entity.type
    this.events[entity.id] = [ ...this.events[entity.id] ?? [], ...entity.unpublishedEvents ]
  }
}
