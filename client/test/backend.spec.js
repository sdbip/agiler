'use strict'

const { expect, assert } = require('chai')
const { get, post } = require('../src/http.js')
const backend = require('../src/backend')

describe('backend', () => {

  beforeEach(() => {
    backend.listenAtPort(8080)
  })

  afterEach(() => {
    backend.stopListening()
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
