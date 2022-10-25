import { expect } from 'chai'
import { patch } from '../../shared/src/http'
import { Progress } from '../src/domain/item'
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

  it('publishes "ProgressChanged" event when items are completed [patch /item/complete]', async () => {
    eventRepository.nextHistory = new EntityHistory(EntityVersion.of(0), [])
    const response = await patch('http://localhost:9090/item/id/complete')

    expect(response.statusCode).to.equal(200)
    expect(eventRepository.lastRequestedEntityId).to.equal('id')
    expect(publisher.publishedEvents).to.have.lengthOf(1)
    expect(publisher.publishedEvents[0]).to.deep.include({
      actor: 'system_actor',
      event: {
        name: 'ProgressChanged',
        details: { progress: Progress.completed },
      },
    })
    expect(publisher.publishedEvents[0].entity.type).to.equal('Item')
  })

  it('projects "ProgressChanged" event when items are completed [patch /item/complete]', async () => {
    eventRepository.nextHistory = new EntityHistory(EntityVersion.of(0), [])
    const response = await patch('http://localhost:9090/item/id/complete')

    expect(response.statusCode).to.equal(200)
    expect(eventProjection.projectedEvents).to.have.lengthOf(1)
    expect(eventProjection.projectedEvents[0])
      .to.deep.include({ name: 'ProgressChanged', details: { progress: Progress.completed } })
  })

  it('returns 404 if not found [patch /item/complete]', async () => {
    const response = await patch('http://localhost:9090/item/id/complete')

    expect(response.statusCode).to.equal(404)
  })
})
