import { assert } from '@esm-bundle/chai'
import { ItemDTO, ItemType, Progress } from '../browser-src/backend/dtos'
import { ItemCache, ItemCacheEvent } from '../browser-src/item-cache'
import { MockWriteModel, stubReadModel } from './mocks'

describe(`${ItemCache.name}.completeTask`, () => {

  const readModel = stubReadModel()
  const writeModel = new MockWriteModel()

  it('forwards to the backend', async () => {
    const cache = new ItemCache(readModel, writeModel)
    await cache.completeTask('task')
    assert.equal(writeModel.lastCompletedId, 'task')
  })

  it('notifies that the item is now a Story', async () => {
    let notifiedItems: ItemDTO[] = []

    const cache = new ItemCache(readModel, writeModel)
    cache.cacheItem({
      id: 'task',
      progress: Progress.notStarted,
      title: 'Complete Me',
      type: ItemType.Task,
    })
    cache.on(ItemCacheEvent.ItemsChanged, items => {
      notifiedItems = items
    })

    await cache.completeTask('task')
    assert.deepEqual(notifiedItems.map(i => ({ id: i.id, progress: i.progress })), [ { id: 'task', progress: Progress.completed } ])
  })
})
