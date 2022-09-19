'use strict'

import { expect, assert } from 'chai'
import { get, post } from '../src/http.js'
import { setRepository, listenAtPort, stopListening } from '../src/backend.js'
import InMem from '../src/inmem.js'

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
    expect(inmem.items).to.eql([ { title: 'Get Shit Done' } ])
  })

  it('returns stored tasks [get /tasks]', async () => {
    inmem.items = [ { title:'Make GET work' } ]
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

  it('throws if port number is missing', () => {
    expect(() => listenAtPort()).to.throw()
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
