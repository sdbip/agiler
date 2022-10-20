export type Event = {
  get name(): string
  get details(): any
}

export interface EventPublisher {
  publish(entityId: string, entityType: string, events: Event[]): Promise<void>;
}
