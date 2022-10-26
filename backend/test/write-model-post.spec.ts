import { expect } from 'chai'
import { post } from '../../shared/src/http'
import { ItemType } from '../src/domain/item'
import { EntityHistory, EntityVersion, PublishedEvent } from '../src/es/source'
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

      expect(response.statusCode).to.equal(200)
      expect(publisher.publishedEvents).to.have.lengthOf(1)
      expect(publisher.publishedEvents[0]).to.deep.include({
        actor: 'system_actor',
        event: {
          name: 'Created',
          details: { title: 'Get Shit Done', type: ItemType.Task },
        },
      })
      expect(publisher.publishedEvents[0].entity.type).to.equal('Item')
    })

    it('projects "Created" event', async () => {
      const response = await post(`${TEST_DOMAIN}/item`, {
        title: 'Get Shit Done',
      })

      expect(response.statusCode).to.equal(200)
      expect(eventProjection.projectedEvents).to.have.lengthOf(1)
      expect(eventProjection.projectedEvents[0])
        .to.deep.include({ name: 'Created', details: { title: 'Get Shit Done', type: ItemType.Task } })
    })

    it('returns task id', async () => {
      const response = await post(`${TEST_DOMAIN}/item`, {
        title: 'Get Shit Done',
      })

      expect(JSON.parse(response.content).id).to.exist
    })
  })

  describe('post /item/task', () => {

    it('publishes "ChildrenAdded" and "ParentChanged" events', async () => {
      eventRepository.nextHistory = new EntityHistory(EntityVersion.of(0), [
        new PublishedEvent('TypeChanged', JSON.stringify({ type: ItemType.Story })),
      ])

      const response = await post(`${TEST_DOMAIN}/item/story_id/task`, { title: 'Get Shit Done' })

      expect(response.statusCode).to.equal(200)
      expect(eventRepository.lastRequestedEntityId).to.equal('story_id')
      expect(publisher.publishedEvents).to.have.lengthOf(2)
      expect(publisher.publishedEvents[0]).to.deep.include({
        actor: 'system_actor',
        event: {
          name: 'ChildrenAdded',
          details: { children: [ JSON.parse(response.content).id ] },
        },
      })
      expect(publisher.publishedEvents[1]).to.deep.include({
        actor: 'system_actor',
        event: {
          name: 'ParentChanged',
          details: { parent: 'story_id' },
        },
      })
      expect(publisher.publishedEvents[1].entity.type).to.equal('Item')
    })

    it('projects "ChildrenAdded" and "ParentChanged" events', async () => {
      eventRepository.nextHistory = new EntityHistory(EntityVersion.of(0), [
        new PublishedEvent('TypeChanged', JSON.stringify({ type: ItemType.Story })),
      ])
      const response = await post(`${TEST_DOMAIN}/item/story_id/task`, { title: 'Get Shit Done' })

      expect(response.statusCode).to.equal(200)
      expect(eventProjection.projectedEvents).to.have.lengthOf(2)
      expect(eventProjection.projectedEvents[0])
        .to.deep.include({ name: 'ChildrenAdded', details: { children: [ JSON.parse(response.content).id ] } })
      expect(eventProjection.projectedEvents[1])
        .to.deep.include({ name: 'ParentChanged', details: { parent: 'story_id' } })
    })

    it('returns 404 if story not found', async () => {
      const response = await post(`${TEST_DOMAIN}/item/story_id/task`, { title: 'Get Shit Done' })

      expect(response.statusCode).to.equal(404)
    })
  })
})
