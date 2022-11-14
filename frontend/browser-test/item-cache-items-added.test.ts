import { assert } from '@esm-bundle/chai'
import { ItemDTO } from '../../backend/src/dtos/item-dto'
import { ItemType, Progress } from '../../backend/src/dtos/enums'
import { ItemCache, ItemCacheEvent } from '../browser-src/item-cache'

describe(ItemCache.name, () => {

  describe(ItemCacheEvent.ItemsAdded, () => {

    it('notifies new items', () => {
      const model = new ItemCache()
      let addedItems: ItemDTO[] | undefined
      model.on(ItemCacheEvent.ItemsAdded, items => {
        addedItems = items
      })

      const items = [ {
        id: '1',
        progress: Progress.notStarted,
        title: 'Get it done',
        type: ItemType.Task,
      } ]
      model.update(undefined, items)
      assert.deepEqual(addedItems, items)
    })

    it('does not notify existing items', () => {
      const model = new ItemCache()

      model.update(undefined, [
        {
          id: '1',
          progress: Progress.notStarted,
          title: 'Get it done',
          type: ItemType.Task,
        },
      ])
      let addedItems = undefined as any as ItemDTO[]
      model.on(ItemCacheEvent.ItemsAdded, items => {
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
      model.update(undefined, items)
      assert.notInclude(addedItems.map(i => i.id), '1')
    })
  })

  it('does not notify at all if no items added', () => {
    const model = new ItemCache()

    model.update(undefined, [
      {
        id: '1',
        progress: Progress.notStarted,
        title: 'Get it done',
        type: ItemType.Task,
      },
    ])
    let addedItems = false
    model.on(ItemCacheEvent.ItemsAdded, () => {
      addedItems = true
    })

    const items = [ {
      id: '1',
      progress: Progress.notStarted,
      title: 'Item 1',
      type: ItemType.Task,
    } ]
    model.update(undefined, items)
    assert.isFalse(addedItems)
  })
})
