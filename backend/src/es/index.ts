export class Event {
  constructor(readonly name: string, readonly details: any) {}
}

export class EntityVersion {
  static NotSaved = new EntityVersion(-5)
  private constructor(readonly value: number) {}

  static of(value: number) {
    if (value < 0) throw new Error()
    return new EntityVersion(value)
  }

  equals(other: EntityVersion) {
    return other.value === this.value
  }
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

export class EntityHistory {
  constructor(readonly events: Event[]) {}
}

export interface EventPublisher {
  publishChanges(entity: Entity): Promise<void>
}

export interface EventRepository {
  getHistoryFor(entityId: string): Promise<EntityHistory>
  getEvents(entityId: string): Promise<Event[]>
}
