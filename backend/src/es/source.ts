import { failFast } from '../../../shared/src/failFast.js'

export class UnpublishedEvent {
  constructor(readonly name: string, readonly details: any) {
    failFast.unlessString(name, 'name')
    failFast.unlessObject(details, 'details')
  }
}

export class PublishedEvent {
  get details() {
    return JSON.parse(this.detailsJSON)
  }

  constructor(readonly name: string, readonly detailsJSON: string) {
    failFast.unlessString(name, 'name')
    failFast.unlessString(detailsJSON, 'details')
  }
}

export class EntityVersion {
  static new = new EntityVersion(-1)

  private constructor(readonly value: number) { }

  static of(value: number) {
    failFast.unlessNumber(value, 'version')
    failFast.unless(value >= 0, 'version must not be negative')
    return new EntityVersion(value)
  }

  equals(other: EntityVersion) {
    failFast.unlessInstanceOf(EntityVersion)(other, 'other')
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

  constructor(readonly entityId: CanonicalEntityId, readonly version: EntityVersion) {
    failFast.unlessInstanceOf(CanonicalEntityId)(entityId, 'entityId')
    failFast.unlessInstanceOf(EntityVersion)(version, 'version')
  }

  protected addEvent(event: UnpublishedEvent) {
    failFast.unlessInstanceOf(UnpublishedEvent)(event, 'event')
    this.unpublishedEvents.push(event)
  }
}

export class CanonicalEntityId {
  constructor(readonly id: string, readonly type: string) {
    failFast.unlessString(id, 'id')
    failFast.unlessString(type, 'type')
  }

  equals(other: CanonicalEntityId): any {
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
