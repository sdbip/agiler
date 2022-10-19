import { assert, expect } from 'chai'
import { Progress, Item, ItemType } from '../../src/domain/item'

describe('Item', () => {
  it('has expected initial values', () => {
    const item = Item.new('Get it done')
    expect(item.progress).to.equal(Progress.notStarted)
    expect(item.title).to.equal('Get it done')
    assert.ok(item.id)
  })

  it('can be completed', () => {
    const item = Item.new('Get it done')
    item.complete()
    expect(item.progress).to.equal(Progress.completed)
  })

  it('can be assigned', () => {
    const item = Item.new('Get it done')
    item.assign('Kenny Starfighter')
    expect(item.progress).to.equal(Progress.inProgress)
    expect(item.assignee).to.equal('Kenny Starfighter')
  })

  it('can be promoted to story', () => {
    const item = Item.new('Get it done')
    expect(item.type).to.equal(ItemType.Task)

    item.promote()
    expect(item.type).to.equal(ItemType.Story)
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
})
