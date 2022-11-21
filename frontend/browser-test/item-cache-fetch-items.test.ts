import { assert } from '@esm-bundle/chai'
import { ItemDTO, ItemType, Progress } from '../browser-src/backend/dtos'
import { ItemCache, ItemCacheEvent } from '../browser-src/item-cache'
import { MockReadModel, stubWriteModel } from './mocks'

describe(ItemCache.name, () => {

  const writeModel = stubWriteModel()
  const readModel = new MockReadModel()

  describe('fetchItems', () => {

    it('notifies when items are ready', async () => {
      const cache = new ItemCache(readModel, writeModel)
      const item = {
        id: 'id',
        progress: Progress.notStarted,
        title: 'title',
        type: ItemType.Task,
      }
      readModel.itemsToReturn = [ item ]

      let notifiedItems: ItemDTO[] = []
      cache.on(ItemCacheEvent.ItemsAdded, (items) => {
        notifiedItems = items
      })

      const returnedItems = await cache.fetchItems(undefined, [ ItemType.Task ])

      assert.deepEqual(returnedItems, [ item ])
      assert.deepEqual(notifiedItems, [ item ])
    })

    it('does not notify existing items', async () => {
      const item1 = {
        id: '1',
        progress: Progress.notStarted,
        title: 'Item 1',
        type: ItemType.Task,
      }
      const item2 = {
        id: '2',
        progress: Progress.notStarted,
        title: 'Item 2',
        type: ItemType.Task,
      }
      readModel.itemsToReturn = [ item1, item2 ]

      const cache = new ItemCache(readModel, writeModel)
      cache.addItem(item1)

      let notifiedItems: ItemDTO[] = []
      cache.on(ItemCacheEvent.ItemsAdded, items => {
        notifiedItems = items
      })

      await cache.fetchItems(undefined, [ ItemType.Task ])
      assert.notInclude(notifiedItems.map(i => i.id), '1')
    })

    it('does not notify at all if no items added', async () => {
      const item = {
        id: 'item',
        progress: Progress.notStarted,
        title: 'Get it done',
        type: ItemType.Task,
      }
      readModel.itemsToReturn = [ item ]

      const cache = new ItemCache(readModel, writeModel)
      cache.addItem(item)

      let isNotified = false
      cache.on(ItemCacheEvent.ItemsAdded, () => { isNotified = true })

      const returnedItems = await cache.fetchItems(undefined, [ ItemType.Task ])
      assert.deepEqual(returnedItems, [ item ])
      assert.isFalse(isNotified)
    })
  })
})
