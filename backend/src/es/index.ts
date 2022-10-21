export class Event {
  constructor(readonly name: string, readonly details: any) {}
}

export class EntityId {
  constructor(readonly id: string, readonly type: string) {}
}

export interface EventPublisher {
  publish(events: Event[], entity: EntityId): Promise<void>
}

export interface EventRepository {
  getEvents(entityId: string): Promise<Event[]>
}
