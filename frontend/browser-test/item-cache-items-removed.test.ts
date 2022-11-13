import { assert } from '@esm-bundle/chai'
import { ItemDTO } from '../../backend/src/dtos/item-dto'
import { ItemType, Progress } from '../../backend/src/dtos/enums'
import { ItemCache, ItemCacheEvent } from '../browser-src/item-cache'

describe(ItemCache.name, () => {

  describe(ItemCacheEvent.ItemsRemoved, () => {

    it('does not notify when only adding items', () => {
      const cache = new ItemCache()
      let removedItems = false
      cache.on(ItemCacheEvent.ItemsRemoved, () => {
        removedItems = true
      })

      const items = [ {
        id: '1',
        progress: Progress.notStarted,
        title: 'Get it done',
        type: ItemType.Task,
      } ]
      cache.update(items)
      assert.isFalse(removedItems)
    })

    it('does not notify when only updating items', () => {
      const cache = new ItemCache()

      cache.update([
        {
          id: '1',
          progress: Progress.notStarted,
          title: 'Get it done',
          type: ItemType.Task,
        },
      ])
      let removedItems = false
      cache.on(ItemCacheEvent.ItemsAdded, () => {
        removedItems = true
      })

      const items = [ {
        id: '1',
        progress: Progress.notStarted,
        title: 'Item 1',
        type: ItemType.Task,
      } ]
      cache.update(items)
      assert.isFalse(removedItems)
    })

    it('notifies removed items', () => {
      const cache = new ItemCache()

      cache.update([
        {
          id: '1',
          progress: Progress.notStarted,
          title: 'Get it done',
          type: ItemType.Task,
        },
      ])
      let removedItems = undefined as any as ItemDTO[]
      cache.on(ItemCacheEvent.ItemsRemoved, items => {
        removedItems = items
      })

      cache.update([])
      assert.exists(removedItems)
      assert.include(removedItems.map(i => i.id), '1')
    })
  })
})
