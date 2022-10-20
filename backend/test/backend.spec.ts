import { expect, assert } from 'chai'
import { get, patch, post } from '../../shared/src/http'
import { setEventRepository, setRepository, listenAtPort, stopListening, setPublisher } from '../src/backend'
import { InMem } from './repository/inmem'
import { ItemType, Progress } from '../src/domain/item'

const inmem = new InMem()
setRepository(inmem)
setPublisher(inmem)
setEventRepository(inmem)

describe('backend', () => {

  beforeEach(() => {
    inmem.entityTypes = {}
    inmem.events = {}
    inmem.items = {}
    listenAtPort(9090)
  })

  afterEach(() => {
    stopListening()
  })

  it('adds tasks to repository [post /task]', async () => {
    const response = await post('http://localhost:9090/task', {
      title: 'Get Shit Done',
    })

    expect(response.statusCode).to.equal(200)
    expect(
      Object.values(inmem.items)
        .map(i => ({ title: i[1].title })),
      ).to.eql([ { title: 'Get Shit Done' } ])
  })

  it('publishes "Created" event when tasks are added [post /task]', async () => {
    const response = await post('http://localhost:9090/task', {
      title: 'Get Shit Done',
    })

    expect(response.statusCode).to.equal(200)
    expect(Object.values(inmem.events)[0])
      .to.eql([ { name: 'Created', details: { title: 'Get Shit Done', type: ItemType.Task } } ])
    expect(Object.values(inmem.entityTypes)[0]).to.eql('Item')
  })

  it('returns task details [post /task]', async () => {
    const response = await post('http://localhost:9090/task', {
      title: 'Get Shit Done',
    })

    const dto = JSON.parse(response.content)
    expect(dto.title).to.equal('Get Shit Done')
    assert.ok(dto.id)
  })

  it('promotes tasks [patch /task/:id/promote]', async () => {
    inmem.entityTypes = { id: 'Item' }
    inmem.events = { id: [] }
    inmem.items = {
      id: [
        ItemType.Task,
        {
          title: 'Get Shit Done',
          progress: Progress.notStarted,
          assignee: null,
        },
      ],
    }
    const response = await patch('http://localhost:9090/task/id/promote')

    expect(response.statusCode).to.equal(200)
    expect(inmem.items['id'][0]).to.equal(ItemType.Story)
  })

  it('publishes "TypeChanged" event when tasks are promoted [post /task]', async () => {
    inmem.entityTypes = { id: 'Item' }
    inmem.events = { id: [] }
    const response = await patch('http://localhost:9090/task/id/promote')

    expect(response.statusCode).to.equal(200)
    expect(inmem.events['id'])
      .to.eql([ { name: 'TypeChanged', details: { type: ItemType.Story } } ])
    expect(inmem.entityTypes['id']).to.eql('Item')
  })

  it('returns 404 if not found [patch /task/:id/promote]', async () => {
    const response = await patch('http://localhost:9090/task/id/promote')

    expect(response.statusCode).to.equal(404)
  })

  it('assigns task [patch /task/:id/assign]', async () => {
    inmem.entityTypes = { id: 'Item' }
    inmem.events = { id: [] }
    inmem.items = {
      id: [
        ItemType.Task,
        {
          title: 'Get Shit Done',
          progress: Progress.notStarted,
          assignee: null,
        },
      ],
    }
    const response = await patch('http://localhost:9090/task/id/assign', { member: 'Johan' })

    expect(response.statusCode).to.equal(200)
    expect(inmem.items['id'][1].progress).to.equal(Progress.inProgress)
    expect(inmem.items['id'][1].assignee).to.equal('Johan')
  })

  it('publishes events when tasks are assigned [post /task]', async () => {
    inmem.entityTypes = { id: 'Item' }
    inmem.events = { id: [] }
    const response = await patch('http://localhost:9090/task/id/assign', { member:'Johan' })

    expect(response.statusCode).to.equal(200)
    expect(inmem.events['id']).to.deep.include
      .members([ { name: 'AssigneeChanged', details: { assignee:'Johan' } } ])
    expect(inmem.entityTypes['id']).to.eql('Item')
  })

  it('returns 404 if not found [patch /task/:id/assign]', async () => {
    const response = await patch('http://localhost:9090/task/id/assign')

    expect(response.statusCode).to.equal(404)
  })

  it('completes task [patch /task/:id/complete]', async () => {
    inmem.entityTypes = { id: 'Item' }
    inmem.events = { id: [] }
    inmem.items = {
      id: [
        ItemType.Task,
        {
          title: 'Get Shit Done',
          progress: Progress.notStarted,
          assignee: null,
        },
      ],
    }
    const response = await patch('http://localhost:9090/task/id/complete')

    expect(response.statusCode).to.equal(200)
    expect(inmem.items['id'][1].progress).to.equal(Progress.completed)
  })

  it('publishes "ProgressChanged" event when tasks are completed [post /task]', async () => {
    inmem.entityTypes = { id: 'Item' }
    inmem.events = { id: [] }
    const response = await patch('http://localhost:9090/task/id/complete')

    expect(response.statusCode).to.equal(200)
    expect(inmem.events['id'])
      .to.eql([ { name: 'ProgressChanged', details: { progress: Progress.completed } } ])
    expect(inmem.entityTypes['id']).to.eql('Item')
  })

  it('returns 404 if not found [patch /task/:id/complete]', async () => {
    const response = await patch('http://localhost:9090/task/id/complete')

    expect(response.statusCode).to.equal(404)
  })

  it('returns stories as well as tasks [get /task]', async () => {
    inmem.items = {
      'one': [
        ItemType.Task,
        {
          title: 'Task',
          progress: Progress.notStarted,
          assignee: null,
        },
      ],
      'two': [
        ItemType.Story,
        {
          title: 'Story',
          progress: Progress.notStarted,
          assignee: null,
        },
      ],
    }
    const response = await get('http://localhost:9090/task')

    expect(response.statusCode).to.equal(200)

    const dtos = JSON.parse(response.content)
    expect(dtos?.length).to.equal(2)

    const dto = dtos[0]
    expect(dto.title).to.equal('Task')
    assert.ok(dto.id)
  })

  it('returns open tasks only [get /task]', async () => {
    inmem.items = {
      'one': [
        ItemType.Task,
        {
          title: 'New task',
          progress: Progress.notStarted,
          assignee: null,
        },
      ],
      'two': [
        ItemType.Task,
        {
          title: 'Completed task',
          progress: Progress.completed,
          assignee: null,
        },
      ],
    }
    const response = await get('http://localhost:9090/task')

    expect(response.statusCode).to.equal(200)

    const dtos = JSON.parse(response.content)
    expect(dtos?.length).to.equal(1)

    const dto = dtos[0]
    expect(dto.title).to.equal('New task')
    assert.ok(dto.id)
  })

  it('yields an error if stopping twice', async () => {
    let isFailure = true
    try {
      await stopListening()
      isFailure = false
      await stopListening()
      isFailure = true
    }
    catch (error) {
    }
    if (isFailure) assert.fail('No error thrown')
  })

  it('can start and stop multiple times', async () => {
    for (let i = 0; i < 5; i++) {
      await stopListening()
      listenAtPort(9090)
      const response = await get('http://localhost:9090/task')
      expect(response.statusCode).to.equal(200)
    }
  })

})
