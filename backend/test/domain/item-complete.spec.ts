import { expect } from 'chai'
import { Progress, Item, ItemType } from '../../src/domain/item'
import { EntityVersion, PublishedEvent } from '../../src/es/source'

describe('Item.complete', () => {

  it('completes the task', () => {
    const item = Item.reconstitute('id', EntityVersion.new, [])
    item.complete()
    const event = item.unpublishedEvents.find(e => e.name === 'ProgressChanged')
    expect(event?.details.progress).to.equal(Progress.completed)
  })

  it('throws if not a task', () => {
    const item = Item.reconstitute('id', EntityVersion.new, [
      new PublishedEvent('TypeChanged', JSON.stringify({ type: ItemType.Story })),
    ])
    expect(() => item.complete()).to.throw()
    expect(item.unpublishedEvents).to.have.lengthOf(0)
  })
})
