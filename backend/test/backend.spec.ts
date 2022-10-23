import { expect } from 'chai'
import { get, patch, post } from '../../shared/src/http'
import { ItemType, Progress } from '../src/domain/item'
import { EntityHistory, EntityVersion } from '../src/es/source'
import { MockEventProjection, MockItemRepository, MockEventRepository, MockEventPublisher } from './mocks'
import backend from '../src/backend'

describe('backend', () => {

  beforeEach(() => {
    backend.listenAtPort(9090)
  })

  afterEach(() => {
    backend.stopListening()
  })

  describe('Read Model', () => {

    let itemRepository: MockItemRepository
    
    beforeEach(() => {
      itemRepository = new MockItemRepository()
      backend.setRepository(itemRepository)
    })
  
    it('returns the items of the repository [get /task]', async () => {
      itemRepository.itemsToReturn = [
        {
          id: 'one',
          type: ItemType.Task,
          title: 'Task',
          progress: Progress.notStarted,
          assignee: null,
        },
        {
          id: 'two',
          type: ItemType.Story,
          title: 'Story',
          progress: Progress.notStarted,
          assignee: null,
        },
      ]
      const response = await get('http://localhost:9090/task')
  
      expect(response.statusCode).to.equal(200)
  
      const dtos = JSON.parse(response.content)
      expect(dtos?.length).to.equal(2)
  
      const dto = dtos[0]
      expect(dto.title).to.equal('Task')
      expect(dto.id).to.exist
    })
  
    it('requests open tasks only [get /task]', async () => {
      const response = await get('http://localhost:9090/task')
  
      expect(response.statusCode).to.equal(200)
      expect(itemRepository.lastRequestedProgress).to.equal(Progress.notStarted)
    })
  
    it('yields an error if stopping twice', async () => {
      let isFailure = true
      try {
        await backend.stopListening()
        isFailure = false
        await backend.stopListening()
        isFailure = true
      } catch (error) {}
      if (isFailure) expect.fail('No error thrown')
    })
  
    it('can start and stop multiple times', async () => {
      for (let i = 0; i < 5; i++) {
        await backend.stopListening()
        backend.listenAtPort(9090)
        const response = await get('http://localhost:9090/task')
        expect(response.statusCode).to.equal(200)
      }
    })
  })

  describe('Write Model', () => {
    
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
  
    it('publishes "Created" event when tasks are added [post /task]', async () => {
      const response = await post('http://localhost:9090/task', {
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

    it('projects "Created" event when tasks are added [post /task]', async () => {
      const response = await post('http://localhost:9090/task', {
        title: 'Get Shit Done',
      })

      expect(response.statusCode).to.equal(200)
      expect(eventProjection.projectedEvents).to.have.lengthOf(1)
      expect(eventProjection.projectedEvents[0])
        .to.deep.equal({ name: 'Created', details: { title: 'Get Shit Done', type: ItemType.Task } })
    })

    it('returns task details [post /task]', async () => {
      const response = await post('http://localhost:9090/task', {
        title: 'Get Shit Done',
      })

      const dto = JSON.parse(response.content)
      expect(dto.title).to.equal('Get Shit Done')
      expect(dto.id).to.exist
    })

    it('publishes "TypeChanged" event when tasks are promoted [post /task]', async () => {
      eventRepository.nextHistory = new EntityHistory(EntityVersion.of(0), [])
      publisher.expectedVersion = EntityVersion.of(0)
      const response = await patch('http://localhost:9090/task/id/promote')

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

    it('projects "TypeChanged" event when tasks are promoted [post /task]', async () => {
      eventRepository.nextHistory = new EntityHistory(EntityVersion.of(0), [])
      publisher.expectedVersion = EntityVersion.of(0)
      const response = await patch('http://localhost:9090/task/id/promote')

      expect(response.statusCode).to.equal(200)
      expect(eventProjection.projectedEvents).to.have.lengthOf(1)
      expect(eventProjection.projectedEvents[0])
        .to.deep.equal({ name: 'TypeChanged', details: { type: ItemType.Story } })
    })

    it('returns 404 if not found [patch /task/:id/promote]', async () => {
      const response = await patch('http://localhost:9090/task/id/promote')

      expect(response.statusCode).to.equal(404)
    })

    it('publishes events when tasks are assigned [post /task]', async () => {
      eventRepository.nextHistory = new EntityHistory(EntityVersion.of(0), [])
      publisher.expectedVersion = EntityVersion.of(0)
      const response = await patch('http://localhost:9090/task/id/assign', { member:'Johan' })

      expect(response.statusCode).to.equal(200)
      expect(eventRepository.lastRequestedEntityId).to.equal('id')
      expect(publisher.publishedEvents).to.have.length.greaterThanOrEqual(1)
      expect(publisher.publishedEvents[0]).to.deep.include({
        actor: 'system_actor',
        event: {
          name: 'AssigneeChanged',
          details: { assignee:'Johan' },
        },
      })
      expect(publisher.publishedEvents[0].entity.type).to.equal('Item')
    })

    it('projects events when tasks are assigned [post /task]', async () => {
      eventRepository.nextHistory = new EntityHistory(EntityVersion.of(0), [])
      publisher.expectedVersion = EntityVersion.of(0)
      const response = await patch('http://localhost:9090/task/id/assign', { member:'Johan' })

      expect(response.statusCode).to.equal(200)
      expect(eventProjection.projectedEvents).to.have.lengthOf(2)
      expect(eventProjection.projectedEvents).to.deep.include
        .members([ { name: 'AssigneeChanged', details: { assignee:'Johan' } } ])
    })

    it('returns 404 if not found [patch /task/:id/assign]', async () => {
      const response = await patch('http://localhost:9090/task/id/assign')

      expect(response.statusCode).to.equal(404)
    })

    it('publishes "ProgressChanged" event when tasks are completed [post /task]', async () => {
      eventRepository.nextHistory = new EntityHistory(EntityVersion.of(0), [])
      publisher.expectedVersion = EntityVersion.of(0)
      const response = await patch('http://localhost:9090/task/id/complete')

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

    it('projects "ProgressChanged" event when tasks are completed [post /task]', async () => {
      eventRepository.nextHistory = new EntityHistory(EntityVersion.of(0), [])
      publisher.expectedVersion = EntityVersion.of(0)
      const response = await patch('http://localhost:9090/task/id/complete')

      expect(response.statusCode).to.equal(200)
      expect(eventProjection.projectedEvents).to.have.lengthOf(1)
      expect(eventProjection.projectedEvents[0])
        .to.deep.equal({ name: 'ProgressChanged', details: { progress: Progress.completed } })
    })

    it('returns 404 if not found [patch /task/:id/complete]', async () => {
      const response = await patch('http://localhost:9090/task/id/complete')

      expect(response.statusCode).to.equal(404)
    })
  })
})
