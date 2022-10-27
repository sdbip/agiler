import { ItemRepository } from '../src/read-model'
import { Progress } from '../src/domain/item'
import {
  Entity, EntityHistory, CanonicalEntityId,
  UnpublishedEvent, EventPublisher, EventRepository,
} from '../src/es/source'
import { Event, EventProjection } from '../src/es/projection'
import { ItemDTO } from '../src/dtos/item-dto'

export class MockItemRepository implements ItemRepository {
  lastRequestedProgress?: Progress
  itemsToReturn: ItemDTO[] = []

  async itemsWithProgress(progress: Progress): Promise<ItemDTO[]> {
    this.lastRequestedProgress = progress
    return this.itemsToReturn
  }
}

export class MockEventProjection implements EventProjection {
  projectedEvents: Event[] = []

  async project(events: Event[]) {
    this.projectedEvents = [ ...this.projectedEvents, ...events ]
  }
}

export class MockEventRepository implements EventRepository {
  nextHistory?: EntityHistory
  lastRequestedEntityId?: string

  async getHistoryFor(entityId: string) {
    this.lastRequestedEntityId = entityId
    return this.nextHistory
  }
}

export class MockEventPublisher implements EventPublisher {
  publishedEvents: {actor: string, entity: CanonicalEntityId, event: UnpublishedEvent}[] = []

  async publishChanges(entity: Entity, actor: string): Promise<void> {
    this.publishedEvents = [ ...this.publishedEvents, ...entity.unpublishedEvents.map(event => ({ actor, entity: entity.entityId, event })) ]
  }
}
