import { assert } from 'chai'
import { get } from '../../shared/src/http'
import { ItemType, Progress } from '../src/dtos/enums'
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

    it('returns the specified item', async () => {
      itemRepository.itemToReturn = {
        id: 'one',
        type: ItemType.Task,
        title: 'Task',
        progress: Progress.notStarted,
      }

      const response = await get(_ + '/item/one')
      const dto = JSON.parse(response.content)

      assert.equal(itemRepository.lastRequestedItemId, 'one')
      assert.deepEqual(dto, {
        id: 'one',
        type: ItemType.Task,
        title: 'Task',
        progress: Progress.notStarted,
      })
    })

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

      assert.equal(response.statusCode, 200)

      const dtos = JSON.parse(response.content)
      assert.lengthOf(dtos, 2)

      const dto = dtos[0]
      assert.equal(dto.title, 'Task')
      assert.exists(dto.id)
    })

    it('requests open items only', async () => {
      const response = await get(_ + '/item')

      assert.equal(response.statusCode, 200)
      assert.deepInclude(
        itemRepository.lastRequestedSpecfication,
        { progress: Progress.notStarted })
    })

    it('requests unparented items only', async () => {
      const response = await get(_ + '/item')

      assert.equal(response.statusCode, 200)
      assert.deepInclude(
        itemRepository.lastRequestedSpecfication,
        { parent: null })
    })

    it('requests only items of the specified type', async () => {
      itemRepository.itemsToReturn = []
      const response = await get(_ + '/item?type=Feature|Epic')
      assert.equal(response.statusCode, 200)

      assert.deepInclude(
        itemRepository.lastRequestedSpecfication,
        { type: [ ItemType.Feature, ItemType.Epic ] })
    })
  })

  describe('get /item/child', () => {

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
      const response = await get(_ + '/item/id/child')

      assert.equal(response.statusCode, 200)

      const dtos = JSON.parse(response.content)
      assert.lengthOf(dtos, 2)

      const dto = dtos[0]
      assert.equal(dto.title, 'Task')
      assert.exists(dto.id)
    })

    it('requests open items only', async () => {
      const response = await get(_ + '/item/id/child')

      assert.equal(response.statusCode, 200)
      assert.deepInclude(
        itemRepository.lastRequestedSpecfication,
        { progress: Progress.notStarted })
    })

    it('requests the expected children only', async () => {
      const response = await get(_ + '/item/id/child')

      assert.equal(response.statusCode, 200)
      assert.deepInclude(
        itemRepository.lastRequestedSpecfication,
        { parent: 'id' })
    })

    it('requests only items of the specified type', async () => {
      itemRepository.itemsToReturn = []
      const response = await get(_ + '/item/id/child?type=Feature|Epic')
      assert.equal(response.statusCode, 200)

      assert.deepInclude(
        itemRepository.lastRequestedSpecfication,
        { type: [ ItemType.Feature, ItemType.Epic ] })
    })
  })
})
