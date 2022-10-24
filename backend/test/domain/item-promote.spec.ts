import { expect } from 'chai'
import { Item, ItemType } from '../../src/domain/item'
import { EntityVersion } from '../../src/es/source'
import { reconstituteStory } from './reconstitute'

describe('Item.promote', () => {

  it('promotes a Task to a Story', () => {
    const item = Item.reconstitute('id', EntityVersion.new, [])
    item.promote()
    expect(item.unpublishedEvents.length).to.equal(1)

    const event = item.unpublishedEvents.find(e => e.name === 'TypeChanged')
    expect(event?.details.type).to.equal(ItemType.Story)
  })

  it('throws if promoted from Story', () => {
    const item = reconstituteStory('id')
    expect(() => item.promote()).to.throw()
    expect(item.unpublishedEvents).has.lengthOf(0)
  })
})
