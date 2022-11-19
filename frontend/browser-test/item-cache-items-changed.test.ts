import { assert } from '@esm-bundle/chai'
import { ItemDTO, ItemType, Progress } from '../browser-src/backend/dtos'
import { ItemCache, ItemCacheEvent } from '../browser-src/item-cache'

describe(ItemCache.name, () => {

  describe(ItemCacheEvent.ItemsChanged, () => {

    it('does not notify if adding items', () => {
      const cache = new ItemCache()
      let changedItems = false
      cache.on(ItemCacheEvent.ItemsChanged, () => {
        changedItems = true
      })

      const items = [ {
        id: '1',
        progress: Progress.notStarted,
        title: 'Get it done',
        type: ItemType.Task,
      } ]
      cache.update(undefined, items)
      assert.isFalse(changedItems)
    })

    it('notifies items with changed title', () => {
      const cache = new ItemCache()

      cache.update(undefined, [
        {
          id: '1',
          progress: Progress.notStarted,
          title: 'Get it done',
          type: ItemType.Task,
        },
      ])
      let changedItems = undefined as any as ItemDTO[]
      cache.on(ItemCacheEvent.ItemsChanged, items => {
        changedItems = items
      })

      const items: ItemDTO[] = [ {
        id: '1',
        progress: Progress.notStarted,
        title: 'Item 1',
        type: ItemType.Task,
      } ]
      cache.update(undefined, items)
      assert.deepEqual(changedItems, items)
    })
  })
})
