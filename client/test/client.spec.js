'use strict'

import { expect, assert } from 'chai'
import { get } from '../src/http.js'
import client from '../src/client.js'

describe('server', () => {

  beforeEach(() => {
    client.listenAtPort(8080)
  })

  afterEach(() => {
    client.stopListening()
  })

  it('responds to get /', async () => {
    const response = await get('http://localhost:8080')
    expect(response.statusCode).to.equal(200)
    assert.isOk(response.content)
    expect(response.content[0]).to.equal('<')
  })

  it('yields an error if stopping twice', async () => {
    try {
      await client.stopListening()
      await client.stopListening()
      assert.fail('No error thrown')
    }
    catch (error) {
    }
  })

  it('throws if port number is missing', () => {
    expect(() => client.listenAtPort()).to.throw()
  })

  it('can start and stop multiple times', async () => {
    for (let i = 0; i < 5; i++) {
      await client.stopListening()
      client.listenAtPort(8080)
      const response = await get('http://localhost:8080')
      expect(response.statusCode).to.equal(200)
    }
  })

})
