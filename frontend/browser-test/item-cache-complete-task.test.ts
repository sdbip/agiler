import { assert } from '@esm-bundle/chai'
import { ItemDTO, ItemType, Progress } from '../browser-src/backend/dtos'
import { ItemCache, ItemCacheEvent } from '../browser-src/item-cache'
import { MockBackend } from './mocks'

describe(`${ItemCache.name}.completeTask`, () => {

  const backend = new MockBackend()

  it('forwards to the backend', async () => {
    const cache = new ItemCache(backend)
    await cache.completeTask('task')
    assert.equal(backend.lastCompletedId, 'task')
  })

  it('notifies that the item is now a Story', async () => {
    let notifiedItems: ItemDTO[] = []

    const cache = new ItemCache(backend)
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
