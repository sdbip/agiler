import { Event, EventPublisher, EventRepository } from '../../src/es'

export class InMemEventStore implements EventRepository, EventPublisher {
  entityTypes: {[id: string]: string} = {}
  events: {[id: string]: Event[]} = {}

  async getEvents(entityId: string) {
    return this.events[entityId]
  }

  async publish(entityId: string, entityType: string, events: Event[]) {
    this.entityTypes[entityId] = entityType
    this.events[entityId] = [ ...this.events[entityId] ?? [], ...events ]
  }
}
