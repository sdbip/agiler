import { Entity, EntityHistory, EntityVersion, Event, EventPublisher, EventRepository } from '../../src/es/source'

export class InMemEventStore implements EventRepository, EventPublisher {
  entities: {[id: string]: [EntityVersion, string]} = {}
  events: {[id: string]: Event[]} = {}

  async getHistoryFor(entityId: string) {
    return this.entities[entityId]
      ? new EntityHistory(this.entities[entityId][0], this.events[entityId])
      : null
  }

  async publishChanges(entity: Entity, actor: string): Promise<void> {
    const storedVersion = this.entities[entity.id]?.[0]
    if ((storedVersion && !storedVersion.equals(entity.version)) ||
        !storedVersion && entity.version !== EntityVersion.NotSaved)
      throw new Error('Wrong version')

    this.entities[entity.id] = [ entity.version, entity.type ]
    this.events[entity.id] = [ ...this.events[entity.id] ?? [], ...entity.unpublishedEvents.map(e => ({ ...e, actor: actor })) ]
  }
}
