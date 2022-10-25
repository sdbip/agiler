import { expect } from 'chai'
import { patch, post } from '../../shared/src/http'
import { ItemType, Progress } from '../src/domain/item'
import { EntityHistory, EntityVersion, PublishedEvent } from '../src/es/source'
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

  it('publishes "Created" event when tasks are added [post /item]', async () => {
    const response = await post('http://localhost:9090/item', {
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

  it('projects "Created" event when tasks are added [post /item]', async () => {
    const response = await post('http://localhost:9090/item', {
      title: 'Get Shit Done',
    })

    expect(response.statusCode).to.equal(200)
    expect(eventProjection.projectedEvents).to.have.lengthOf(1)
    expect(eventProjection.projectedEvents[0])
      .to.deep.include({ name: 'Created', details: { title: 'Get Shit Done', type: ItemType.Task } })
  })

  it('returns task id [post /item]', async () => {
    const response = await post('http://localhost:9090/item', { title: 'Get Shit Done' })

    expect(JSON.parse(response.content).id).to.exist
  })

  it('publishes "TypeChanged" event when tasks are promoted [patch /item/promote]', async () => {
    eventRepository.nextHistory = new EntityHistory(EntityVersion.of(0), [])
    const response = await patch('http://localhost:9090/item/id/promote')

    expect(response.statusCode).to.equal(200)
    expect(eventRepository.lastRequestedEntityId).to.equal('id')
    expect(publisher.publishedEvents).to.have.lengthOf(1)
    expect(publisher.publishedEvents[0]).to.deep.include({
      actor: 'system_actor',
      event: {
        name: 'TypeChanged',
        details: { type: ItemType.Story },
      },
    })
    expect(publisher.publishedEvents[0].entity.type).to.equal('Item')
  })

  it('projects "TypeChanged" event when tasks are promoted [patch /item/promote]', async () => {
    eventRepository.nextHistory = new EntityHistory(EntityVersion.of(0), [])
    const response = await patch('http://localhost:9090/item/id/promote')

    expect(response.statusCode).to.equal(200)
    expect(eventProjection.projectedEvents).to.have.lengthOf(1)
    expect(eventProjection.projectedEvents[0])
      .to.deep.include({ name: 'TypeChanged', details: { type: ItemType.Story } })
  })

  it('returns 404 if not found [patch /item/promote]', async () => {
    const response = await patch('http://localhost:9090/item/id/promote')

    expect(response.statusCode).to.equal(404)
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

  it('publishes "ChildrenAdded" event when tasks are added to story [post /item/task]', async () => {
    eventRepository.nextHistory = new EntityHistory(EntityVersion.of(0), [
      new PublishedEvent('TypeChanged', JSON.stringify({ type: ItemType.Story })),
    ])

    const response = await post('http://localhost:9090/item/story_id/task', { title: 'Get Shit Done' })

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

  it('projects "ChildrenAdded" event when tasks are added to story [patch /item/parent]', async () => {
    eventRepository.nextHistory = new EntityHistory(EntityVersion.of(0), [
      new PublishedEvent('TypeChanged', JSON.stringify({ type: ItemType.Story })),
    ])
    const response = await post('http://localhost:9090/item/story_id/task', { title: 'Get Shit Done' })

    expect(response.statusCode).to.equal(200)
    expect(eventProjection.projectedEvents).to.have.lengthOf(2)
    expect(eventProjection.projectedEvents[0])
      .to.deep.include({ name: 'ChildrenAdded', details: { children: [ JSON.parse(response.content).id ] } })
    expect(eventProjection.projectedEvents[1])
      .to.deep.include({ name: 'ParentChanged', details: { parent: 'story_id' } })
  })

  it('returns 404 if story not found [post /item/task]', async () => {
    const response = await post('http://localhost:9090/item/id/task', { title: 'Get Shit Done' })

    expect(response.statusCode).to.equal(404)
  })
})
