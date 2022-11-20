import { ItemRepository, ItemSpecification } from '../src/read-model'
import {
  Entity, EntityHistory, CanonicalEntityId,
  UnpublishedEvent, EventPublisher, EventRepository,
} from '../src/es/source'
import { Event, EventProjection } from '../src/es/projection'
import { ItemDTO } from '../src/dtos/item-dto'

export class MockItemRepository implements ItemRepository {
  lastRequestedSpecfication?: ItemSpecification
  itemsToReturn: ItemDTO[] = []

  lastRequestedItemId?: string
  itemToReturn?: ItemDTO

  async get(id: string) {
    this.lastRequestedItemId = id
    return this.itemToReturn
  }

  async itemsWithSpecification(specification: ItemSpecification): Promise<ItemDTO[]> {
    this.lastRequestedSpecfication = specification
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
