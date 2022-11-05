import { assert } from 'chai'
import { patch } from '../../shared/src/http'
import { Progress } from '../src/domain/item'
import { EntityHistory, EntityVersion } from '../src/es/source'
import { MockEventProjection, MockEventRepository, MockEventPublisher } from './mocks'
import backend from '../src/write-model'
import { TEST_DOMAIN, TEST_PORT } from './test-defaults'

describe('write model', () => {

  describe('patch /item/x/complete', () => {

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

    it('publishes "ProgressChanged" event when items are completed [patch /item/complete]', async () => {
      eventRepository.nextHistory = new EntityHistory(EntityVersion.of(0), [])
      const response = await patch(`${TEST_DOMAIN}/item/id/complete`)

      assert.equal(response.statusCode, 200)
      assert.equal(eventRepository.lastRequestedEntityId, 'id')
      assert.lengthOf(publisher.publishedEvents, 1)
      assert.deepInclude(
        publisher.publishedEvents[0],
        {
          actor: 'system_actor',
          event: {
            name: 'ProgressChanged',
            details: { progress: Progress.completed },
          },
        })
      assert.equal(publisher.publishedEvents[0].entity.type, 'Item')
    })

    it('projects "ProgressChanged" event when items are completed [patch /item/complete]', async () => {
      eventRepository.nextHistory = new EntityHistory(EntityVersion.of(0), [])
      const response = await patch(`${TEST_DOMAIN}/item/id/complete`)

      assert.equal(response.statusCode, 200)
      assert.lengthOf(eventProjection.projectedEvents, 1)
      assert.deepInclude(
        eventProjection.projectedEvents[0],
        { name: 'ProgressChanged', details: { progress: Progress.completed } })
    })

    it('returns 404 if not found [patch /item/complete]', async () => {
      const response = await patch(`${TEST_DOMAIN}/item/id/complete`)

      assert.equal(response.statusCode, 404)
    })
  })
})
