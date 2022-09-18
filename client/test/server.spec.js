'use strict'

const { expect, assert } = require('chai')
const { get, post } = require('../src/http.js')

let server
let serverSetup

describe('get', () => {

  beforeEach(() => {
    serverSetup = require('../src/server').setupServer()
    server = serverSetup.finalize()
    server.listenAtPort(8080)
  })

  afterEach(() => {
    server.stopListening()
  })

  it('executes handler', async () => {
    serverSetup.get('/path', (_, response) => {
      response.end('foo')
    })
    const response = await get('http://localhost:8080/path')

    expect(response.statusCode).to.equal(200)
    expect(response.content).to.equal('foo')
  })

  it('returns 500 if handler throws', async () => {
    serverSetup.get('/path', async () => {
      throw new Error('foo')
    })
    const response = await get('http://localhost:8080/path')

    expect(response.statusCode).to.equal(500)
  })
})

describe('post', () => {

  beforeEach(() => {
    serverSetup = require('../src/server').setupServer()
    server = serverSetup.finalize()
    server.listenAtPort(8080)
  })

  afterEach(() => {
    server.stopListening()
  })

  it('executes handler', async () => {
    serverSetup.post('/path', (_, response) => {
      response.end('foo')
    })
    const response = await post('http://localhost:8080/path', {})

    expect(response.statusCode).to.equal(200)
    expect(response.content).to.equal('foo')
  })

  it('returns 500 if handler throws', async () => {
    serverSetup.post('/path', async () => {
      throw new Error('foo')
    })
    const response = await post('http://localhost:8080/path', {})

    expect(response.statusCode).to.equal(500)
  })
})
