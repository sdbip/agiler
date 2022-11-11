import { assert } from 'chai'
import { post } from '../../shared/src/http'
import { ItemEvent, ItemType } from '../src/domain/item'
import { CanonicalEntityId, EntityHistory, EntityVersion, PublishedEvent } from '../src/es/source'
import { MockEventProjection, MockEventRepository, MockEventPublisher } from './mocks'
import backend from '../src/write-model'
import { TEST_DOMAIN, TEST_PORT } from './test-defaults'

describe('write model', () => {

  let eventProjection: MockEventProjection
  let eventRepository: MockEventRepository
  let publisher: MockEventPublisher

  beforeEach(() => {
    eventProjection = new MockEventProjection()
    eventRepository = new MockEventRepository()
    publisher = new MockEventPublisher()

    backend.setEventProjection(eventProjection)
    backend.setEventRepository(eventRepository)
    backend.setPublisher(publisher)
  })

  beforeEach(() => {
    backend.listenAtPort(TEST_PORT)
  })

  afterEach(() => {
    backend.stopListening()
  })

  describe('post /item', () => {

    it('publishes "Created" event', async () => {
      const response = await post(`${TEST_DOMAIN}/item`, {
        title: 'Get Shit Done',
      })

      assert.equal(response.statusCode, 200)
      assert.lengthOf(publisher.publishedEvents, 1)
      assert.deepInclude(publisher.publishedEvents[0], {
        actor: 'system_actor',
        event: {
          name: ItemEvent.Created,
          details: { title: 'Get Shit Done', type: ItemType.Task },
        },
      })
      assert.equal(publisher.publishedEvents[0].entity.type, 'Item')
    })

    it('projects "Created" event', async () => {
      const response = await post(`${TEST_DOMAIN}/item`, {
        title: 'Get Shit Done',
      })

      assert.equal(response.statusCode, 200)
      assert.lengthOf(eventProjection.projectedEvents, 1)
      assert.deepInclude(
        eventProjection.projectedEvents[0],
        { name: ItemEvent.Created, details: { title: 'Get Shit Done', type: ItemType.Task } })
    })

    it('returns task id', async () => {
      const response = await post(`${TEST_DOMAIN}/item`, {
        title: 'Get Shit Done',
      })

      assert.exists(JSON.parse(response.content).id)
    })
  })

  describe('post /item (feature)', () => {

    it('publishes "Created" event', async () => {
      const response = await post(`${TEST_DOMAIN}/item`, {
        title: 'Produce some value',
        type: ItemType.Feature,
      })

      assert.equal(response.statusCode, 200)
      assert.lengthOf(publisher.publishedEvents, 1)
      assert.deepInclude(publisher.publishedEvents[0], {
        actor: 'system_actor',
        event: {
          name: ItemEvent.Created,
          details: { title: 'Produce some value', type: ItemType.Feature },
        },
      })
      assert.equal(publisher.publishedEvents[0].entity.type, 'Item')
    })

    it('projects "Created" event', async () => {
      const response = await post(`${TEST_DOMAIN}/item`, {
        title: 'Produce some value',
        type: ItemType.Feature,
      })

      assert.equal(response.statusCode, 200)
      assert.lengthOf(eventProjection.projectedEvents, 1)
      assert.deepInclude(
        eventProjection.projectedEvents[0],
        { name: ItemEvent.Created, details: { title: 'Produce some value', type: ItemType.Feature } })
    })
  })

  describe('post /item/mmf', () => {

    it('publishes "ChildrenAdded" and "ParentChanged" events', async () => {
      eventRepository.nextHistory = new EntityHistory(EntityVersion.of(0), [
        new PublishedEvent(ItemEvent.TypeChanged, JSON.stringify({ type: ItemType.Feature })),
      ])

      const response = await post(`${TEST_DOMAIN}/item/epic_id/mmf`, { title: 'Produce some value' })

      assert.equal(response.statusCode, 200)
      assert.equal(eventRepository.lastRequestedEntityId, 'epic_id')

      const createdEvent = publisher.publishedEvents.find(e => e.event.name === ItemEvent.Created)
      const childrenAddedEvent = publisher.publishedEvents.find(e => e.event.name === ItemEvent.ChildrenAdded)
      const parentChangedEvent = publisher.publishedEvents.find(e => e.event.name === ItemEvent.ParentChanged)
      assert.deepInclude(childrenAddedEvent, {
        actor: 'system_actor',
        event: {
          name: ItemEvent.ChildrenAdded,
          details: { children: [ JSON.parse(response.content).id ] },
        },
      })
      assert.deepInclude(parentChangedEvent, {
        actor: 'system_actor',
        event: {
          name: ItemEvent.ParentChanged,
          details: { parent: 'epic_id' },
        },
      })
      assert.deepInclude(createdEvent, {
        actor: 'system_actor',
        event: {
          name: ItemEvent.Created,
          details: { title: 'Produce some value', type: ItemType.Feature },
        },
      })
    })

    it('projects "ChildrenAdded" and "ParentChanged" events', async () => {
      eventRepository.nextHistory = new EntityHistory(EntityVersion.of(0), [
        new PublishedEvent(ItemEvent.TypeChanged, JSON.stringify({ type: ItemType.Story })),
      ])
      const response = await post(`${TEST_DOMAIN}/item/story_id/task`, { title: 'Produce some value' })

      assert.equal(response.statusCode, 200)

      const createdEvent = findProjectedEvent(ItemEvent.Created)
      const childrenAddedEvent = findProjectedEvent(ItemEvent.ChildrenAdded)
      const parentChangedEvent = findProjectedEvent(ItemEvent.ParentChanged)
      assert.deepInclude(childrenAddedEvent, { details: { children: [ JSON.parse(response.content).id ] } })
      assert.deepInclude(parentChangedEvent, { details: { parent: 'story_id' } })
      assert.deepInclude(createdEvent, { details: { title: 'Produce some value', type: ItemType.Task } })

      assert.deepEqual(childrenAddedEvent?.entity, new CanonicalEntityId('story_id', 'Item'))
      assert.equal(createdEvent?.entity.type, 'Item')
      assert.equal(parentChangedEvent?.entity.type, 'Item')
    })

    it('returns 404 if story not found', async () => {
      const response = await post(`${TEST_DOMAIN}/item/story_id/task`, { title: 'Produce some value' })

      assert.equal(response.statusCode, 404)
    })
  })

  describe('post /item/task', () => {

    it('publishes "ChildrenAdded" and "ParentChanged" events', async () => {
      eventRepository.nextHistory = new EntityHistory(EntityVersion.of(0), [
        new PublishedEvent(ItemEvent.TypeChanged, JSON.stringify({ type: ItemType.Story })),
      ])

      const response = await post(`${TEST_DOMAIN}/item/story_id/task`, { title: 'Get Shit Done' })

      assert.equal(response.statusCode, 200)
      assert.equal(eventRepository.lastRequestedEntityId, 'story_id')

      const createdEvent = publisher.publishedEvents.find(e => e.event.name === ItemEvent.Created)
      const childrenAddedEvent = publisher.publishedEvents.find(e => e.event.name === ItemEvent.ChildrenAdded)
      const parentChangedEvent = publisher.publishedEvents.find(e => e.event.name === ItemEvent.ParentChanged)
      assert.deepInclude(childrenAddedEvent, {
        actor: 'system_actor',
        event: {
          name: ItemEvent.ChildrenAdded,
          details: { children: [ JSON.parse(response.content).id ] },
        },
      })
      assert.deepInclude(parentChangedEvent, {
        actor: 'system_actor',
        event: {
          name: ItemEvent.ParentChanged,
          details: { parent: 'story_id' },
        },
      })
      assert.deepInclude(createdEvent, {
        actor: 'system_actor',
        event: {
          name: ItemEvent.Created,
          details: { title: 'Get Shit Done', type: ItemType.Task },
        },
      })
    })

    it('projects "ChildrenAdded" and "ParentChanged" events', async () => {
      eventRepository.nextHistory = new EntityHistory(EntityVersion.of(0), [
        new PublishedEvent(ItemEvent.TypeChanged, JSON.stringify({ type: ItemType.Story })),
      ])
      const response = await post(`${TEST_DOMAIN}/item/story_id/task`, { title: 'Get Shit Done' })

      assert.equal(response.statusCode, 200)

      const createdEvent = findProjectedEvent(ItemEvent.Created)
      const childrenAddedEvent = findProjectedEvent(ItemEvent.ChildrenAdded)
      const parentChangedEvent = findProjectedEvent(ItemEvent.ParentChanged)
      assert.deepInclude(childrenAddedEvent, { details: { children: [ JSON.parse(response.content).id ] } })
      assert.deepInclude(parentChangedEvent, { details: { parent: 'story_id' } })
      assert.deepInclude(createdEvent, { details: { title: 'Get Shit Done', type: ItemType.Task } })

      assert.deepEqual(childrenAddedEvent?.entity, new CanonicalEntityId('story_id', 'Item'))
      assert.equal(createdEvent?.entity.type, 'Item')
      assert.equal(parentChangedEvent?.entity.type, 'Item')
    })

    it('returns 404 if story not found', async () => {
      const response = await post(`${TEST_DOMAIN}/item/story_id/task`, { title: 'Get Shit Done' })

      assert.equal(response.statusCode, 404)
    })
  })

  const findProjectedEvent = (event: ItemEvent) =>
    eventProjection.projectedEvents.find(e => e.name === event)
})
