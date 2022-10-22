import { failFast } from './failFast.js'

export class Event {
  constructor(readonly name: string, readonly details: any) {
    failFast.unlessObject(details, 'details')
  }
}

export class EntityVersion {
  static NotSaved = new EntityVersion(-5)
  private constructor(readonly value: number) {}

  static of(value: number) {
    failFast.unlessNumber(value, 'version')
    failFast.unless(value >= 0, 'version must not be negative')
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
  constructor(readonly id: string, readonly type: string) {
    failFast.unlessString(id, 'id')
    failFast.unlessString(type, 'type')
  }
}

export class EntityHistory {
  constructor(readonly version: EntityVersion, readonly events: Event[]) {
    failFast.unlessInstanceOf(EntityVersion)(version, 'version')
    failFast.unlessArrayOf(Event)(events, 'events')
  }
}

export interface EventPublisher {
  publishChanges(entity: Entity): Promise<void>
}

export interface EventRepository {
  getHistoryFor(entityId: string): Promise<EntityHistory | null>
}
