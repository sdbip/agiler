import { expect, assert } from 'chai'
import { get, patch, post } from '../../shared/src/http'
import { setRepository, listenAtPort, stopListening } from '../src/backend'
import InMem from './repository/inmem'
import { Progress } from '../src/domain/item'

const inmem = new InMem()
setRepository(inmem)

describe('backend', () => {

  beforeEach(() => {
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
        .map(i => ({ title: i.title })),
      ).to.eql([ { title: 'Get Shit Done' } ])
  })

  it('returns task details [post /task]', async () => {
    const response = await post('http://localhost:9090/task', {
      title: 'Get Shit Done',
    })

    const dto = JSON.parse(response.content)
    expect(dto.title).to.equal('Get Shit Done')
    assert.ok(dto.id)
  })

  it('assigns task [patch /task/:id/assign]', async () => {
    inmem.items = {
      id: {
        title: 'Get Shit Done',
        progress: Progress.notStarted,
        assignee: null,
      },
    }
    const response = await patch('http://localhost:9090/task/id/assign', { member: 'Johan' })

    expect(response.statusCode).to.equal(200)
    expect(inmem.items['id'].progress).to.equal(Progress.inProgress)
    expect(inmem.items['id'].assignee).to.equal('Johan')
  })

  it('completes task [patch /task/:id/complete]', async () => {
    inmem.items = {
      id: {
        title: 'Get Shit Done',
        progress: Progress.notStarted,
        assignee: null,
      },
    }
    const response = await patch('http://localhost:9090/task/id/complete')

    expect(response.statusCode).to.equal(200)
    expect(inmem.items['id'].progress).to.equal(Progress.completed)
  })

  it('returns 404 if not found [patch /task/:id/complete]', async () => {
    const response = await patch('http://localhost:9090/task/id/complete')

    expect(response.statusCode).to.equal(404)
  })

  it('returns open tasks only [get /task]', async () => {
    inmem.items = {
      'one': {
        title: 'New task',
        progress: Progress.notStarted,
        assignee: null,
      },
      'two': {
        title: 'Completed task',
        progress: Progress.completed,
        assignee: null,
      },
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
