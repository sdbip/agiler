import { failFast } from './failFast.js'

export class UnpublishedEvent {
  constructor(readonly name: string, readonly details: any) {
    failFast.unlessString(name, 'name')
    failFast.unlessObject(details, 'details')
  }
}

export class PublishedEvent {
  constructor(readonly name: string, readonly details: string) {
    failFast.unlessString(name, 'name')
    failFast.unlessString(details, 'details')
  }
}

export class EntityVersion {
  static NotSaved = new EntityVersion(-1)
  private constructor(readonly value: number) {}

  static of(value: number) {
    failFast.unlessNumber(value, 'version')
    failFast.unless(value >= 0, 'version must not be negative')
    return new EntityVersion(value)
  }

  equals(other: EntityVersion) {
    return other.value === this.value
  }

  next(): EntityVersion {
    return EntityVersion.of(this.value + 1)
  }
}

export abstract class Entity {
  readonly unpublishedEvents: UnpublishedEvent[] = []

  get id() { return this.entityId.id }
  get type() { return this.entityId.type }

  constructor(readonly entityId: EntityId, readonly version: EntityVersion) {
    failFast.unlessInstanceOf(EntityId)(entityId, 'entityId')
    failFast.unlessInstanceOf(EntityVersion)(version, 'version')
  }

  protected addEvent(event: UnpublishedEvent) {
    this.unpublishedEvents.push(event)
  }
}

export class EntityId {
  constructor(readonly id: string, readonly type: string) {
    failFast.unlessString(id, 'id')
    failFast.unlessString(type, 'type')
  }

  equals(other: EntityId): any {
    return other.id === this.id && other.type === this.type
  }
}

export class EntityHistory {
  constructor(readonly version: EntityVersion, readonly events: PublishedEvent[]) {
    failFast.unlessInstanceOf(EntityVersion)(version, 'version')
    failFast.unlessArrayOf(PublishedEvent)(events, 'events')
  }
}

export interface EventPublisher {
  publishChanges(entity: Entity, actor: string): Promise<void>
}

export interface EventRepository {
  getHistoryFor(entityId: string): Promise<EntityHistory | undefined>
}
