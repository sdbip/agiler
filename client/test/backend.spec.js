'use strict'

const { expect, assert } = require('chai')
const { get, post } = require('../src/http.js')
const backend = require('../src/backend')
const InMem = require('../src/inmem')

const inmem = new InMem()
backend.setRepository(inmem)

describe('backend', () => {

  beforeEach(() => {
    inmem.items = []
    backend.listenAtPort(8080)
  })

  afterEach(() => {
    backend.stopListening()
  })

  it('adds tasks to repository [post /tasks]', async () => {
    const response = await post('http://localhost:8080/tasks', {
      title: 'Get Shit Done',
    })

    expect(response.statusCode).to.equal(200)
    expect(inmem.getAll()).to.eql([ { title: 'Get Shit Done' } ])
  })

  it('returns stored tasks [get /tasks]', async () => {
    inmem.items = [ { title:'Make GET work' } ]
    const response = await get('http://localhost:8080/tasks')

    expect(response.statusCode).to.equal(200)
    expect(response.content).to.equal('[{"title":"Make GET work"}]')
  })

  it('yields an error if stopping twice', async () => {
    try {
      await backend.stopListening()
      await backend.stopListening()
      assert.fail('No error thrown')
    }
    catch (error) {
    }
  })

  it('throws if port number is missing', () => {
    expect(() => backend.listenAtPort()).to.throw()
  })

  it('can start and stop multiple times', async () => {
    for (let i = 0; i < 5; i++) {
      await backend.stopListening()
      backend.listenAtPort(8080)
      const response = await get('http://localhost:8080/tasks')
      expect(response.statusCode).to.equal(200)
    }
  })

})
