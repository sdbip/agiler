'use strict'

const { expect, assert } = require('chai')
const { get } = require('../src/http.js')
const server = require('../src/client')

describe('server', () => {

  beforeEach(() => {
    server.listenAtPort(8080)
  })

  afterEach(() => {
    server.stopListening()
  })

  it('responds to get /', async () => {
    const response = await get('http://localhost:8080')
    expect(response.statusCode).to.equal(200)
    assert.isOk(response.content)
    expect(response.content[0]).to.equal('<')
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
