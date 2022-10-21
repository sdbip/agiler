import { EntityId, Event, EventPublisher, EventRepository } from '../../src/es'

export class InMemEventStore implements EventRepository, EventPublisher {
  entityTypes: {[id: string]: string} = {}
  events: {[id: string]: Event[]} = {}

  async getEvents(entityId: string) {
    return this.events[entityId]
  }

  async publish(events: Event[], entity: EntityId) {
    this.entityTypes[entity.id] = entity.type
    this.events[entity.id] = [ ...this.events[entity.id] ?? [], ...events ]
  }
}
