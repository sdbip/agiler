import { assert } from 'chai'
import { patch } from '../../shared/src/http'
import { EntityHistory, EntityVersion } from '../src/es/source'
import { MockEventProjection, MockEventRepository, MockEventPublisher } from './mocks'
import backend from '../src/write-model'
import { TEST_DOMAIN, TEST_PORT } from './test-defaults'
import { ItemEvent } from '../src/domain/item'

describe('write model', () => {

  describe('patch /item/*/assign', () => {

    beforeEach(() => {
      backend.listenAtPort(TEST_PORT)
    })

    afterEach(() => {
      backend.stopListening()
    })

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

    it('publishes events', async () => {
      eventRepository.nextHistory = new EntityHistory(EntityVersion.of(0), [])
      const response = await patch(`${TEST_DOMAIN}/item/id/assign`, { member: 'Johan' })

      assert.equal(response.statusCode, 200)
      assert.equal(eventRepository.lastRequestedEntityId, 'id')
      assert.isAtLeast(publisher.publishedEvents.length, 1)
      assert.deepInclude(
        publisher.publishedEvents[0],
        {
          actor: 'system_actor',
          event: {
            name: ItemEvent.AssigneeChanged,
            details: { assignee: 'Johan' },
          },
        })
      assert.equal(publisher.publishedEvents[0].entity.type, 'Item')
    })

    it('projects events', async () => {
      eventRepository.nextHistory = new EntityHistory(EntityVersion.of(0), [])
      const response = await patch(`${TEST_DOMAIN}/item/id/assign`, { member: 'Johan' })

      assert.equal(response.statusCode, 200)
      assert.lengthOf(eventProjection.projectedEvents, 2)
      assert.includeDeepMembers(eventProjection.projectedEvents.map(e => ({ name: e.name, details: e.details })),
        [ { name: ItemEvent.AssigneeChanged, details: { assignee: 'Johan' } } ])
    })

    it('returns 404 if the id is not found', async () => {
      const response = await patch(`${TEST_DOMAIN}/item/id/assign`, { member: 'Johan' })

      assert.equal(response.statusCode, 404)
    })
  })
})
