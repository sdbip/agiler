import { expect } from 'chai'
import { get } from '../../shared/src/http'
import { MockItemRepository } from './mocks'
import backend from '../src/read-model'

describe('backend', () => {

  before(() => {
    backend.setRepository(new MockItemRepository())
  })

  describe('stopListening', () => {

    it('throws an error if not started', async () => {
      await expectToReject(() => backend.stopListening())
    })

    it('throws an error if already stopped', async () => {
      backend.listenAtPort(9000)
      await backend.stopListening()      
      await expectToReject(() => backend.stopListening())
    })

    it('can start and stop multiple times', async () => {
      for (let i = 0; i < 5; i++) {
        backend.listenAtPort(9000)
        const response = await get('http://localhost:9000/item')
        expect(response.statusCode).to.equal(200)
        await backend.stopListening()
      }
    })

    it('can start and stop multiple times', async () => {
      for (let i = 0; i < 5; i++) {
        const port = 9000 + i
        backend.listenAtPort(port)
        const response = await get(`http://localhost:${port}/item`)
        expect(response.statusCode).to.equal(200)
        await backend.stopListening()
      }
    })
  })
})

const expectToReject = async (action: () => Promise<void>) => {
  let isFailure = true
  try {
    isFailure = false
    await action()
    isFailure = true
  } catch (error) { }
  if (isFailure)
    expect.fail('No error thrown')
}
