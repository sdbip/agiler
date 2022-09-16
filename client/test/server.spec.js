'use strict'

const { expect, assert } = require('chai')
const { get } = require('../src/http.js')
const server = require('../src/server')

describe('server', () => {

  before(() => {
    server.listenAtPort(8080)
  })

  after(() => {
    server.stopListening()
  })

  it('responds', async () => {
    const response = await get('http://localhost:8080')
    expect(response.statusCode).to.equal(200)
    assert.isOk(response.content)
  })

  it('yields an error if stopping twice', async () => {
    try {
      await server.stopListening()
      await server.stopListening()
    }
    catch (error) {
      if (!error) assert.fail()
    }
  })

  it('throws if port number is missing', () => {
    expect(() => server.listenAtPort()).to.throw()
  })

  it('can start and stop multiple times', async () => {
    for (let i = 0; i < 5; i++) {
      server.stopListening()
      server.listenAtPort(8080)
      const response = await get('http://localhost:8080')
      expect(response.statusCode).to.equal(200)
    }
  })

})
