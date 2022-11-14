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
      cache.update(undefined, items)
      assert.isFalse(removedItems)
    })

    it('does not notify removed items with other parent', () => {
      const cache = new ItemCache()

      cache.update(undefined, [
        {
          id: '1',
          progress: Progress.notStarted,
          title: 'Get it done',
          type: ItemType.Task,
        },
      ])

      let removedItems = false
      cache.on(ItemCacheEvent.ItemsRemoved, () => {
        removedItems = true
      })

      const items = [ {
        id: '2',
        progress: Progress.notStarted,
        title: 'Get it done',
        type: ItemType.Task,
        parentId: 'other_parent',
      } ]
      cache.update('other_parent', items)
      assert.isFalse(removedItems)
    })

    it('does notify removed items after update', () => {
      const cache = new ItemCache()
      cache.update(undefined, [
        {
          id: '1',
          progress: Progress.notStarted,
          title: 'Get it done',
          type: ItemType.Task,
        },
      ])
      cache.update('parent', [
        {
          id: '2',
          progress: Progress.notStarted,
          title: 'Get it done',
          type: ItemType.Task,
          parentId: 'parent',
        },
      ])

      let removedItems = false
      cache.on(ItemCacheEvent.ItemsRemoved, () => {
        removedItems = true
      })

      cache.update(undefined, [ {
        id: '3',
        progress: Progress.notStarted,
        title: 'Get it done',
        type: ItemType.Task,
      } ])

      assert.isTrue(removedItems)
    })

    it('notifies removed items', () => {
      const cache = new ItemCache()

      cache.update(undefined, [
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

      cache.update(undefined, [])
      assert.exists(removedItems)
      assert.include(removedItems.map(i => i.id), '1')
    })

    it('does not notify when only updating items', () => {
      const cache = new ItemCache()

      cache.update(undefined, [
        {
          id: '1',
          progress: Progress.notStarted,
          title: 'Get it done',
          type: ItemType.Task,
        },
      ])

      cache.update('other_parent', [
        {
          id: '2',
          progress: Progress.notStarted,
          title: 'Get it done',
          type: ItemType.Task,
          parentId: 'other_parent',
        },
      ])
      let removedItems = undefined as any as ItemDTO[]
      cache.on(ItemCacheEvent.ItemsRemoved, items => {
        removedItems = items
      })

      cache.update(undefined, [])
      assert.include(removedItems.map(i => i.id), '1')
      assert.notInclude(removedItems.map(i => i.id), '2')
    })
  })
})
