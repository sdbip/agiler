import { assert } from 'chai'
import { get } from '../../shared/src/http'
import client from '../src/frontend'

describe('server', () => {

  beforeEach(() => {
    client.listenAtPort(9090)
  })

  afterEach(() => {
    client.stopListening()
  })

  it('responds to get /', async () => {
    const response = await get('http://localhost:9090')
    assert.equal(response.statusCode, 200)
    assert.exists(response.content)
    assert.equal(response.content[0], '<')
  })

  it('responds to get /features', async () => {
    const response = await get('http://localhost:9090/features')
    assert.equal(response.statusCode, 200)
    assert.exists(response.content)
    assert.equal(response.content[0], '<')
  })

  it('yields an error if stopping twice', async () => {
    let isFailure = true
    try {
      await client.stopListening()
      isFailure = false
      await client.stopListening()
      isFailure = true
    }
    catch (error) {
    }
    if (isFailure) assert.fail('No error thrown')
  })

  it('can start and stop multiple times', async () => {
    for (let i = 0; i < 5; i++) {
      await client.stopListening()
      client.listenAtPort(9090)
      const response = await get('http://localhost:9090')
      assert.equal(response.statusCode, 200)
    }
  })

})
