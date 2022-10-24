import { expect } from 'chai'
import { Item, ItemType } from '../../src/domain/item'
import { EntityVersion, PublishedEvent } from '../../src/es/source'

describe('Item.promote', () => {

  it('is changed to a Story when promoted', () => {
    const item = Item.reconstitute('id', EntityVersion.new, [])
    item.promote()
    expect(item.unpublishedEvents.length).to.equal(1)

    const event = item.unpublishedEvents.find(e => e.name === 'TypeChanged')
    expect(event?.details.type).to.equal(ItemType.Story)
  })

  it('throws if promoted from Story', () => {
    const item = Item.reconstitute('id', EntityVersion.new, [
      new PublishedEvent('TypeChanged', JSON.stringify({ type: ItemType.Story })),
    ])
    expect(() => item.promote()).to.throw()
    expect(item.unpublishedEvents).has.lengthOf(0)
  })
})
