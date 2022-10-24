import { expect } from 'chai'
import { Item, ItemType } from '../../src/domain/item'
import { EntityVersion } from '../../src/es/source'

describe('Item.new', () => {

  it('is `new`', () => {
    const item = Item.new('Get it done')
    expect(item.version).to.equal(EntityVersion.new)
  })

  it('has a unique id', () => {
    const item1 = Item.new('Get it done')
    const item2 = Item.new('Get it done')

    expect(item1.id).not.to.equal(item2.id)
  })

  it('has a uuid id', () => {
    const item = Item.new('Get it done')

    expect(item.id).to.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
  })

  it('is created as a Task', () => {
    const item = Item.new('Get it done')
    expect(item.unpublishedEvents.length).to.equal(1)
    const event = item.unpublishedEvents.find(e => e.name === 'Created')
    expect(event?.details.type).to.equal(ItemType.Task)
  })

  it('is created with a title', () => {
    const item = Item.new('Get it done')
    expect(item.unpublishedEvents.length).to.equal(1)
    const event = item.unpublishedEvents.find(e => e.name === 'Created')
    expect(event?.details.title).to.equal('Get it done')
  })
})
