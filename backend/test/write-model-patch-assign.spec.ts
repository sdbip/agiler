import { expect } from 'chai'
import { patch } from '../../shared/src/http'
import { EntityHistory, EntityVersion } from '../src/es/source'
import { MockEventProjection, MockEventRepository, MockEventPublisher } from './mocks'
import backend from '../src/write-model'
import { TEST_DOMAIN, TEST_PORT } from './test-defaults'

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

      expect(response.statusCode).to.equal(200)
      expect(eventRepository.lastRequestedEntityId).to.equal('id')
      expect(publisher.publishedEvents).to.have.length.greaterThanOrEqual(1)
      expect(publisher.publishedEvents[0]).to.deep.include({
        actor: 'system_actor',
        event: {
          name: 'AssigneeChanged',
          details: { assignee: 'Johan' },
        },
      })
      expect(publisher.publishedEvents[0].entity.type).to.equal('Item')
    })

    it('projects events', async () => {
      eventRepository.nextHistory = new EntityHistory(EntityVersion.of(0), [])
      const response = await patch(`${TEST_DOMAIN}/item/id/assign`, { member: 'Johan' })

      expect(response.statusCode).to.equal(200)
      expect(eventProjection.projectedEvents).to.have.lengthOf(2)
      expect(eventProjection.projectedEvents.map(e => ({ name: e.name, details: e.details }))).to
        .deep.include.members([ { name: 'AssigneeChanged', details: { assignee: 'Johan' } } ])
    })

    it('returns 404 if the id is not found', async () => {
      const response = await patch(`${TEST_DOMAIN}/item/id/assign`, { member: 'Johan' })

      expect(response.statusCode).to.equal(404)
    })
  })
})
