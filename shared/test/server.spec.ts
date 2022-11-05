import { assert } from 'chai'
import { get, post } from '../src/http'
import { setupServer, ServerSetup, Server } from '../src/server'

let server: Server
let serverSetup: ServerSetup

describe('get', () => {

  beforeEach(() => {
    serverSetup = setupServer({})
    server = serverSetup.finalize()
    server.listenAtPort(9090)
  })

  afterEach(() => {
    server.stopListening()
  })

  it('executes handler', async () => {
    serverSetup.get('/path', async () => 'foo')
    const response = await get('http://localhost:9090/path')

    assert.equal(response.statusCode, 200)
    assert.equal(response.content, 'foo')
  })

  it('returns 500 if handler throws', async () => {
    serverSetup.get('/path', async () => {
      throw new Error('foo')
    })
    const response = await get('http://localhost:9090/path')

    assert.equal(response.statusCode, 500)
    assert.equal(response.content, '{"error":{"message":"foo"}}')
  })
})

describe('post', () => {

  beforeEach(() => {
    serverSetup = setupServer({})
    server = serverSetup.finalize()
    server.listenAtPort(9090)
  })

  afterEach(() => {
    server.stopListening()
  })

  it('executes handler', async () => {
    serverSetup.post('/path', async () => 'foo')
    const response = await post('http://localhost:9090/path', {})

    assert.equal(response.statusCode, 200)
    assert.equal(response.content, 'foo')
  })

  it('returns 500 if handler throws', async () => {
    serverSetup.post('/path', async () => {
      throw new Error('foo')
    })
    const response = await post('http://localhost:9090/path', {})

    assert.equal(response.statusCode, 500)
  })
})
