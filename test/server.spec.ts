import { expect } from 'chai'
import { get, post } from '../src/http'
import { setupServer } from '../src/server'

let server: any
let serverSetup: any

describe('get', () => {

  beforeEach(() => {
    serverSetup = setupServer()
    server = serverSetup.finalize()
    server.listenAtPort(9090)
  })

  afterEach(() => {
    server.stopListening()
  })

  it('executes handler', async () => {
    serverSetup.get('/path', () => 'foo')
    const response = await get('http://localhost:9090/path')

    expect(response.statusCode).to.equal(200)
    expect(response.content).to.equal('foo')
  })

  it('returns 500 if handler throws', async () => {
    serverSetup.get('/path', async () => {
      throw new Error('foo')
    })
    const response = await get('http://localhost:9090/path')

    expect(response.statusCode).to.equal(500)
    expect(response.content).to.equal('{"error":{"message":"foo"}}')
  })
})

describe('post', () => {

  beforeEach(() => {
    serverSetup = setupServer()
    server = serverSetup.finalize()
    server.listenAtPort(9090)
  })

  afterEach(() => {
    server.stopListening()
  })

  it('executes handler', async () => {
    serverSetup.post('/path', () => ({
      content: 'foo',
    }))
    const response = await post('http://localhost:9090/path', {})

    expect(response.statusCode).to.equal(200)
    expect(response.content).to.equal('foo')
  })

  it('returns 500 if handler throws', async () => {
    serverSetup.post('/path', async () => {
      throw new Error('foo')
    })
    const response = await post('http://localhost:9090/path', {})

    expect(response.statusCode).to.equal(500)
  })
})
