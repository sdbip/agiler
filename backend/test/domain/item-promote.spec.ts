import { assert } from 'chai'
import { Item, ItemEvent, ItemType } from '../../src/domain/item'
import { EntityVersion } from '../../src/es/source'
import { reconstituteStory } from './reconstitute'

describe('Item.promote', () => {

  it('promotes a Task to a Story', () => {
    const item = Item.reconstitute('id', EntityVersion.new, [])
    item.promote()
    assert.equal(item.unpublishedEvents.length, 1)

    const event = item.unpublishedEvents.find(e => e.name === ItemEvent.TypeChanged)
    assert.equal(event?.details.type, ItemType.Story)
  })

  it('throws if promoted from Story', () => {
    const item = reconstituteStory('id')
    assert.throws(() => item.promote())
    assert.lengthOf(item.unpublishedEvents, 0)
  })
})
