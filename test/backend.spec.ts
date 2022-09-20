import { expect, assert } from 'chai'
import { get, post } from '../src/http'
import { setRepository, listenAtPort, stopListening } from '../src/backend'
import InMem from './repository/inmem'
import { Task } from '../src/domain/task'

const inmem = new InMem()
setRepository(inmem)

describe('backend', () => {

  beforeEach(() => {
    inmem.items = []
    listenAtPort(8080)
  })

  afterEach(() => {
    stopListening()
  })

  it('adds tasks to repository [post /tasks]', async () => {
    const response = await post('http://localhost:8080/tasks', {
      title: 'Get Shit Done',
    })

    expect(response.statusCode).to.equal(200)
    expect(inmem.items.map(i => ({ title: i.title }))).to.eql([ { title: 'Get Shit Done' } ])
  })

  it('returns stored tasks [get /tasks]', async () => {
    inmem.items = [ new Task('Make GET work') ]
    const response = await get('http://localhost:8080/tasks')

    expect(response.statusCode).to.equal(200)
    expect(response.content).to.equal('[{"title":"Make GET work"}]')
  })

  it('yields an error if stopping twice', async () => {
    try {
      await stopListening()
      await stopListening()
      assert.fail('No error thrown')
    }
    catch (error) {
    }
  })

  it('can start and stop multiple times', async () => {
    for (let i = 0; i < 5; i++) {
      await stopListening()
      listenAtPort(8080)
      const response = await get('http://localhost:8080/tasks')
      expect(response.statusCode).to.equal(200)
    }
  })

})
