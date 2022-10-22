import { Entity, EntityHistory, EntityVersion, Event, EventPublisher, EventRepository } from '../../src/es'

export class InMemEventStore implements EventRepository, EventPublisher {
  entities: {[id: string]: [EntityVersion, string]} = {}
  events: {[id: string]: Event[]} = {}

  async getHistoryFor(entityId: string) {
    return this.entities[entityId]
      ? new EntityHistory(this.entities[entityId][0], this.events[entityId])
      : null
  }

  async publishChanges(entity: Entity): Promise<void> {
    this.entities[entity.id] = [ EntityVersion.NotSaved, entity.type ]
    this.events[entity.id] = [ ...this.events[entity.id] ?? [], ...entity.unpublishedEvents ]
  }
}
