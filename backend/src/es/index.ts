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
  constructor(readonly events: Event[]) {
    failFast.unlessArrayOf(Event, { argument: events, name: 'events' })
  }
}

export interface EventPublisher {
  publishChanges(entity: Entity): Promise<void>
}

export interface EventRepository {
  getHistoryFor(entityId: string): Promise<EntityHistory | null>
}

// Fail fast stuff
// Move to a library?

const failFast = {
  unlessArrayOf: (type: any, { argument, name }:{argument:any, name:string}) => {
  if (argument === null || argument === undefined)
    throw new Error(`argument ${name} must not be null nor undefined`)
  if (!(argument instanceof Array))
    throw new Error(`argument ${name} must be an array`)
  if (argument.some(e => !(e instanceof type)))
    throw new Error(`argument ${name} must only contain elements of type ${type}`)
  },
}
