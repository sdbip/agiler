import { assert } from '@esm-bundle/chai'
import { ItemDTO, ItemType, Progress } from '../browser-src/backend/dtos'
import { ItemCache, ItemCacheEvent } from '../browser-src/item-cache'
import { MockReadModel, MockWriteModel } from './mocks'

describe(ItemCache.name, () => {

  describe('postItem', () => {

    const writeModel = new MockWriteModel()
    const readModel = new MockReadModel()

    it('assumes details for an added item', async () => {
      let notifiedItems: ItemDTO[] = []

      writeModel.idToReturn = 'id'

      const cache = new ItemCache(readModel, writeModel)
      cache.on(ItemCacheEvent.ItemsAdded, (items) => {
        notifiedItems = items
      })

      await cache.addItem(ItemType.Task, 'title')

      assert.deepEqual(notifiedItems, [ {
        id: 'id',
        progress: Progress.notStarted,
        title: 'title',
        type: ItemType.Task,
      } ])
    })

    it('notifies if the parent changed', async () => {
      let notifiedItems: ItemDTO[] = []

      writeModel.idToReturn = 'id'

      const cache = new ItemCache(readModel, writeModel)
      cache.cacheItem({
        id: 'epic',
        progress: Progress.notStarted,
        title: 'Epic Feature',
        type: ItemType.Feature,
      })
      cache.on(ItemCacheEvent.ItemsChanged, (items) => {
        notifiedItems = items
      })

      await cache.addItem(ItemType.Feature, 'MMF Title', 'epic')

      assert.deepEqual(notifiedItems, [ {
        id: 'epic',
        progress: Progress.notStarted,
        title: 'Epic Feature',
        type: ItemType.Epic,
      } ])
    })

    it('sends the correct properties to the backend', async () => {
      writeModel.idToReturn = 'id'

      const cache = new ItemCache(readModel, writeModel)
      await cache.addItem(ItemType.Feature, 'MMF Title', 'epic')

      assert.equal(writeModel.lastRequestedParentId, 'epic')
      assert.equal(writeModel.lastRequestedTitle, 'MMF Title')
      assert.equal(writeModel.lastRequestedType, ItemType.Feature)
    })

    it('marks the item so it is not notified as removed', async () => {
      let notifiedItems: ItemDTO[] = []

      writeModel.idToReturn = 'id'
      readModel.itemsToReturn = []

      const cache = new ItemCache(readModel, writeModel)
      cache.on(ItemCacheEvent.ItemsRemoved, (items) => {
        notifiedItems = items
      })

      await cache.addItem(ItemType.Task, 'Title')
      await cache.fetchItems(undefined, [ ItemType.Task ])

      assert.lengthOf(notifiedItems, 0)
    })
  })
})
