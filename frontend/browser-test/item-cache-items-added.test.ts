import { assert } from '@esm-bundle/chai'
import { ItemDTO, ItemType, Progress } from '../browser-src/backend/dtos'
import { ItemCache, ItemCacheEvent } from '../browser-src/item-cache'
import { stubReadModel, stubWriteModel } from './stub-backend'

describe(ItemCache.name, () => {

  const readModel = stubReadModel()
  const writeModel = stubWriteModel()

  describe(ItemCacheEvent.ItemsAdded, () => {

    it('notifies new items', () => {
      const cache = new ItemCache(readModel, writeModel)

      let addedItems: ItemDTO[] | undefined
      cache.on(ItemCacheEvent.ItemsAdded, items => {
        addedItems = items
      })

      const items = [ {
        id: '1',
        progress: Progress.notStarted,
        title: 'Get it done',
        type: ItemType.Task,
      } ]
      cache.update(undefined, items)
      assert.deepEqual(addedItems, items)
    })

    it('does not notify existing items', () => {
      const cache = new ItemCache(readModel, writeModel)

      cache.update(undefined, [
        {
          id: '1',
          progress: Progress.notStarted,
          title: 'Get it done',
          type: ItemType.Task,
        },
      ])
      let addedItems = undefined as any as ItemDTO[]
      cache.on(ItemCacheEvent.ItemsAdded, items => {
        addedItems = items
      })

      const items = [ {
        id: '1',
        progress: Progress.notStarted,
        title: 'Item 1',
        type: ItemType.Task,
      }, {
        id: '2',
        progress: Progress.notStarted,
        title: 'Item 2',
        type: ItemType.Task,
      } ]
      cache.update(undefined, items)
      assert.notInclude(addedItems.map(i => i.id), '1')
    })
  })

  it('does not notify at all if no items added', () => {
    const cache = new ItemCache(readModel, writeModel)

    cache.update(undefined, [
      {
        id: '1',
        progress: Progress.notStarted,
        title: 'Get it done',
        type: ItemType.Task,
      },
    ])
    let addedItems = false
    cache.on(ItemCacheEvent.ItemsAdded, () => {
      addedItems = true
    })

    const items = [ {
      id: '1',
      progress: Progress.notStarted,
      title: 'Item 1',
      type: ItemType.Task,
    } ]
    cache.update(undefined, items)
    assert.isFalse(addedItems)
  })
})
