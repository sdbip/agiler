export class Event {
  constructor(readonly name: string, readonly details: any) {}
}

export abstract class Entity {
  readonly unpublishedEvents: Event[] = []

  get id() { return this.entityId.id }
  get type() { return this.entityId.type }

  constructor(readonly entityId: EntityId) {}

  protected addEvent(event: Event) {
    this.unpublishedEvents.push(event)
  }
}

export class EntityId {
  constructor(readonly id: string, readonly type: string) {}
}

export interface EventPublisher {
  publishChanges(entity: Entity): Promise<void>
}

export interface EventRepository {
  getEvents(entityId: string): Promise<Event[]>
}
