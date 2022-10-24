import { expect } from 'chai'
import { get } from '../../shared/src/http'
import { ItemType, Progress } from '../src/dtos/item-dto'
import { MockItemRepository } from './mocks'
import backend from '../src/read-model'

describe('backend read model', () => {

  beforeEach(() => {
    backend.listenAtPort(9090)
  })

  afterEach(() => {
    backend.stopListening()
  })

  let itemRepository: MockItemRepository
  
  beforeEach(() => {
    itemRepository = new MockItemRepository()
    backend.setRepository(itemRepository)
  })

  it('returns the items of the repository [get /item]', async () => {
    itemRepository.itemsToReturn = [
      {
        id: 'one',
        type: ItemType.Task,
        title: 'Task',
        progress: Progress.notStarted,
      },
      {
        id: 'two',
        type: ItemType.Story,
        title: 'Story',
        progress: Progress.notStarted,
      },
    ]
    const response = await get('http://localhost:9090/item')

    expect(response.statusCode).to.equal(200)

    const dtos = JSON.parse(response.content)
    expect(dtos?.length).to.equal(2)

    const dto = dtos[0]
    expect(dto.title).to.equal('Task')
    expect(dto.id).to.exist
  })

  it('requests open items only [get /item]', async () => {
    const response = await get('http://localhost:9090/item')

    expect(response.statusCode).to.equal(200)
    expect(itemRepository.lastRequestedProgress).to.equal(Progress.notStarted)
  })

  it('yields an error if stopping twice', async () => {
    let isFailure = true
    try {
      await backend.stopListening()
      isFailure = false
      await backend.stopListening()
      isFailure = true
    } catch (error) {}
    if (isFailure) expect.fail('No error thrown')
  })

  it('can start and stop multiple times', async () => {
    for (let i = 0; i < 5; i++) {
      await backend.stopListening()
      backend.listenAtPort(9090)
      const response = await get('http://localhost:9090/item')
      expect(response.statusCode).to.equal(200)
    }
  })
})
