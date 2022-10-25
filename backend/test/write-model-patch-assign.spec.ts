import { expect } from 'chai'
import { patch } from '../../shared/src/http'
import { EntityHistory, EntityVersion } from '../src/es/source'
import { MockEventProjection, MockEventRepository, MockEventPublisher } from './mocks'
import backend from '../src/write-model'

describe('backend write model', () => {

  beforeEach(() => {
    backend.listenAtPort(9090)
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

  it('publishes events when items are assigned [patch /item/assign]', async () => {
    eventRepository.nextHistory = new EntityHistory(EntityVersion.of(0), [])
    const response = await patch('http://localhost:9090/item/id/assign', { member: 'Johan' })

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

  it('projects events when items are assigned [patch /item/assign]', async () => {
    eventRepository.nextHistory = new EntityHistory(EntityVersion.of(0), [])
    const response = await patch('http://localhost:9090/item/id/assign', { member: 'Johan' })

    expect(response.statusCode).to.equal(200)
    expect(eventProjection.projectedEvents).to.have.lengthOf(2)
    expect(eventProjection.projectedEvents.map(e => ({ name: e.name, details: e.details }))).to
      .deep.include.members([ { name: 'AssigneeChanged', details: { assignee: 'Johan' } } ])
  })

  it('returns 404 if not found [patch /item/assign]', async () => {
    const response = await patch('http://localhost:9090/item/id/assign')

    expect(response.statusCode).to.equal(404)
  })
})
