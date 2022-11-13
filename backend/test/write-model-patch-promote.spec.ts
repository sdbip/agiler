import { assert } from 'chai'
import { patch } from '../../shared/src/http'
import { ItemEvent, ItemType } from '../src/domain/enums'
import { EntityHistory, EntityVersion } from '../src/es/source'
import { MockEventProjection, MockEventRepository, MockEventPublisher } from './mocks'
import backend from '../src/write-model'
import { TEST_DOMAIN, TEST_PORT } from './test-defaults'

describe('write model', () => {

  describe('patch /item/x/promote', () => {

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

    it('publishes "TypeChanged" event', async () => {
      eventRepository.nextHistory = new EntityHistory(EntityVersion.of(0), [])
      const response = await patch(`${TEST_DOMAIN}/item/id/promote`)

      assert.equal(response.statusCode, 200)
      assert.equal(eventRepository.lastRequestedEntityId, 'id')
      assert.lengthOf(publisher.publishedEvents, 1)
      assert.deepInclude(publisher.publishedEvents[0],
        {
          actor: 'system_actor',
          event: {
            name: ItemEvent.TypeChanged,
            details: { type: ItemType.Story },
          },
        })
      assert.equal(publisher.publishedEvents[0].entity.type, 'Item')
    })

    it('projects "TypeChanged" event]', async () => {
      eventRepository.nextHistory = new EntityHistory(EntityVersion.of(0), [])
      const response = await patch(`${TEST_DOMAIN}/item/id/promote`)

      assert.equal(response.statusCode, 200)
      assert.lengthOf(eventProjection.projectedEvents, 1)
      assert.deepInclude(
        eventProjection.projectedEvents[0],
        { name: ItemEvent.TypeChanged, details: { type: ItemType.Story } })
    })

    it('returns 404 if not found [patch /item/promote]', async () => {
      const response = await patch(`${TEST_DOMAIN}/item/id/promote`)

      assert.equal(response.statusCode, 404)
    })
  })
})
