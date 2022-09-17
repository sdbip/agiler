'use strict'

const { expect, assert } = require('chai')
const { get, post } = require('../src/http.js')
const server = require('../src/server')

describe('server', () => {

  beforeEach(() => {
    server.listenAtPort(8080)
  })

  afterEach(async () => {
    server.stopListening()
  })

  it('responds to get /', async () => {
    const response = await get('http://localhost:8080')
    expect(response.statusCode).to.equal(200)
    assert.isOk(response.content)

  })

  it('responds to post /tasks', async () => {
    const response = await post('http://localhost:8080/tasks', {
      title: 'Get Shit Done',
    })

    expect(response.statusCode).to.equal(200)
    assert.isOk(response.content)
  })

  it('responds to get /tasks', async () => {
    const response = await get('http://localhost:8080/tasks')

    expect(response.statusCode).to.equal(200)
    assert.isOk(response.content)
  })

  it('yields an error if stopping twice', async () => {
    try {
      await server.stopListening()
      await server.stopListening()
      assert.fail('No error thrown')
    }
    catch (error) {
    }
  })

  it('throws if port number is missing', () => {
    expect(() => server.listenAtPort()).to.throw()
  })

  it('can start and stop multiple times', async () => {
    for (let i = 0; i < 5; i++) {
      await server.stopListening()
      server.listenAtPort(8080)
      const response = await get('http://localhost:8080')
      expect(response.statusCode).to.equal(200)
    }
  })

})
