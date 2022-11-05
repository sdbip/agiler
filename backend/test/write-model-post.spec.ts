import { assert } from 'chai'
import { post } from '../../shared/src/http'
import { ItemType } from '../src/domain/item'
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
          name: 'Created',
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
        { name: 'Created', details: { title: 'Get Shit Done', type: ItemType.Task } })
    })

    it('returns task id', async () => {
      const response = await post(`${TEST_DOMAIN}/item`, {
        title: 'Get Shit Done',
      })

      assert.exists(JSON.parse(response.content).id)
    })
  })

  describe('post /item/task', () => {

    it('publishes "ChildrenAdded" and "ParentChanged" events', async () => {
      eventRepository.nextHistory = new EntityHistory(EntityVersion.of(0), [
        new PublishedEvent('TypeChanged', JSON.stringify({ type: ItemType.Story })),
      ])

      const response = await post(`${TEST_DOMAIN}/item/story_id/task`, { title: 'Get Shit Done' })

      assert.equal(response.statusCode, 200)
      assert.equal(eventRepository.lastRequestedEntityId, 'story_id')

      const createdEvent = publisher.publishedEvents.find(e => e.event.name === 'Created')
      const childrenAddedEvent = publisher.publishedEvents.find(e => e.event.name === 'ChildrenAdded')
      const parentChangedEvent = publisher.publishedEvents.find(e => e.event.name === 'ParentChanged')
      assert.deepInclude(childrenAddedEvent, {
        actor: 'system_actor',
        event: {
          name: 'ChildrenAdded',
          details: { children: [ JSON.parse(response.content).id ] },
        },
      })
      assert.deepInclude(parentChangedEvent, {
        actor: 'system_actor',
        event: {
          name: 'ParentChanged',
          details: { parent: 'story_id' },
        },
      })
      assert.deepInclude(createdEvent, {
        actor: 'system_actor',
        event: {
          name: 'Created',
          details: { title: 'Get Shit Done', type: ItemType.Task },
        },
      })
    })

    it('projects "ChildrenAdded" and "ParentChanged" events', async () => {
      eventRepository.nextHistory = new EntityHistory(EntityVersion.of(0), [
        new PublishedEvent('TypeChanged', JSON.stringify({ type: ItemType.Story })),
      ])
      const response = await post(`${TEST_DOMAIN}/item/story_id/task`, { title: 'Get Shit Done' })

      assert.equal(response.statusCode, 200)

      const createdEvent = eventProjection.projectedEvents.find(e => e.name === 'Created')
      const childrenAddedEvent = eventProjection.projectedEvents.find(e => e.name === 'ChildrenAdded')
      const parentChangedEvent = eventProjection.projectedEvents.find(e => e.name === 'ParentChanged')
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
})
