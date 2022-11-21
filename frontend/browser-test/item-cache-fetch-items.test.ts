import { assert } from '@esm-bundle/chai'
import { ItemDTO, ItemType, Progress } from '../browser-src/backend/dtos'
import { ItemCache, ItemCacheEvent } from '../browser-src/item-cache'
import { MockReadModel, stubWriteModel } from './mocks'

describe(`${ItemCache.name}.fetchItems`, () => {

  const writeModel = stubWriteModel()
  const readModel = new MockReadModel()

  describe(`${ItemCacheEvent.ItemsAdded} event`, () => {

    it('notifies when items are ready', async () => {
      const item = {
        id: 'id',
        progress: Progress.notStarted,
        title: 'title',
        type: ItemType.Task,
      }
      readModel.itemsToReturn = [ item ]

      const cache = new ItemCache(readModel, writeModel)

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

  describe(`${ItemCacheEvent.ItemsChanged} event`, () => {

    it('does not notify if only adding items', async () => {
      readModel.itemsToReturn = [ {
        id: 'addedItem',
        progress: Progress.notStarted,
        title: 'title',
        type: ItemType.Task,
      } ]

      const cache = new ItemCache(readModel, writeModel)

      let isNotified = false
      cache.on(ItemCacheEvent.ItemsChanged, () => {
        isNotified = true
      })

      await cache.fetchItems(undefined, [ ItemType.Task ])
      assert.isFalse(isNotified)
    })

    it('notifies items with changed title', async () => {
      const item = {
        id: 'item',
        progress: Progress.notStarted,
        title: 'New title',
        type: ItemType.Task,
      }
      readModel.itemsToReturn = [ item ]

      const cache = new ItemCache(readModel, writeModel)
      cache.addItem({ ...item, title: 'Title before' })

      let changedItems: ItemDTO[] | undefined
      cache.on(ItemCacheEvent.ItemsChanged, items => {
        changedItems = items
      })

      await cache.fetchItems(undefined, [ ItemType.Task ])
      assert.deepEqual(changedItems, [ item ])
    })
  })

  describe(ItemCacheEvent.ItemsRemoved, () => {

    it('does not notify when only adding items', async () => {
      readModel.itemsToReturn = [ {
        id: 'addedItem',
        progress: Progress.notStarted,
        title: 'title',
        type: ItemType.Task,
      } ]

      const cache = new ItemCache(readModel, writeModel)

      let isNotified = false
      cache.on(ItemCacheEvent.ItemsRemoved, () => { isNotified = true })

      await cache.fetchItems(undefined, [ ItemType.Task ])
      assert.isFalse(isNotified)
    })

    it('does notify removed items after update', async () => {
      const item1 = {
        id: 'item1',
        progress: Progress.notStarted,
        title: 'Get it done',
        type: ItemType.Task,
      }
      const item2 = {
        id: 'item2',
        progress: Progress.notStarted,
        title: 'Get it done',
        type: ItemType.Task,
      }
      const itemWithParent = {
        id: 'itemWithParent',
        progress: Progress.notStarted,
        title: 'Get it done',
        type: ItemType.Task,
        parentId: 'parent',
      }

      const cache = new ItemCache(readModel, writeModel)

      readModel.itemsToReturn = [ item1 ]
      await cache.fetchItems(undefined, [ ItemType.Task ])
      readModel.itemsToReturn = [ itemWithParent ]
      await cache.fetchItems('parent', [ ItemType.Task ])

      let isNotified = false
      cache.on(ItemCacheEvent.ItemsRemoved, () => {
        isNotified = true
      })

      readModel.itemsToReturn = [ item2 ]
      await cache.fetchItems(undefined, [ ItemType.Task ])

      assert.isTrue(isNotified)
    })

    it('notifies removed items', async () => {
      const item = {
        id: 'item',
        progress: Progress.notStarted,
        title: 'Get it done',
        type: ItemType.Task,
      }

      const cache = new ItemCache(readModel, writeModel)
      cache.addItem(item)

      let notifiedItems: ItemDTO[] = []
      cache.on(ItemCacheEvent.ItemsRemoved, items => {
        notifiedItems = items
      })

      await cache.fetchItems(undefined, [ ItemType.Task ])
      assert.include(notifiedItems.map(i => i.id), 'item')
    })

    it('does not notify when only updating items', async () => {
      const item1 = {
        id: 'item1',
        progress: Progress.notStarted,
        title: 'New title',
        type: ItemType.Task,
      }
      readModel.itemsToReturn = [ item1 ]

      const cache = new ItemCache(readModel, writeModel)
      cache.addItem({ ...item1, title: 'Old title' })

      let isNotified = false
      cache.on(ItemCacheEvent.ItemsRemoved, () => { isNotified = true })

      await cache.fetchItems(undefined, [ ItemType.Task ])
      assert.isFalse(isNotified)
    })
  })
})
