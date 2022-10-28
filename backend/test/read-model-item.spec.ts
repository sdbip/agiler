import { expect } from 'chai'
import { get } from '../../shared/src/http'
import { ItemType, Progress } from '../src/dtos/item-dto'
import { MockItemRepository } from './mocks'
import backend from '../src/read-model'
import { TEST_DOMAIN as _, TEST_PORT } from './test-defaults'

describe('read model', () => {

  let itemRepository: MockItemRepository

  beforeEach(() => {
    itemRepository = new MockItemRepository()
    backend.setRepository(itemRepository)
  })

  before(() => {
    backend.listenAtPort(TEST_PORT)
  })

  after(() => {
    backend.stopListening()
  })

  describe('get /item', () => {

    it('returns the items of the repository', async () => {
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
      const response = await get(_ + '/item')

      expect(response.statusCode).to.equal(200)

      const dtos = JSON.parse(response.content)
      expect(dtos?.length).to.equal(2)

      const dto = dtos[0]
      expect(dto.title).to.equal('Task')
      expect(dto.id).to.exist
    })

    it('requests open items only', async () => {
      const response = await get(_ + '/item')

      expect(response.statusCode).to.equal(200)
      expect(itemRepository.lastRequestedSpecfication).to.deep.include({ progress: Progress.notStarted })
    })

    it('requests unparented items only', async () => {
      const response = await get(_ + '/item')

      expect(response.statusCode).to.equal(200)
      expect(itemRepository.lastRequestedSpecfication).to.deep.include({ parent: null })
    })
  })

  describe('get /item/task', () => {

    it('returns child items', async () => {
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
      const response = await get(_ + '/item/id/task')

      expect(response.statusCode).to.equal(200)

      const dtos = JSON.parse(response.content)
      expect(dtos?.length).to.equal(2)

      const dto = dtos[0]
      expect(dto.title).to.equal('Task')
      expect(dto.id).to.exist
    })

    it('requests open items only', async () => {
      const response = await get(_ + '/item/id/task')

      expect(response.statusCode).to.equal(200)
      expect(itemRepository.lastRequestedSpecfication).to.deep.include({ progress: Progress.notStarted })
    })

    it('requests the expected children only', async () => {
      const response = await get(_ + '/item/id/task')

      expect(response.statusCode).to.equal(200)
      expect(itemRepository.lastRequestedSpecfication).to.deep.include({ parent: 'id' })
    })
  })
})
