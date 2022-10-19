import { assert, expect } from 'chai'
import { Progress, Item, ItemType } from '../../src/domain/item'

describe('Item', () => {
  it('has expected initial values', () => {
    const item = Item.new('Get it done')
    expect(item.progress).to.equal(Progress.notStarted)
    expect(item.title).to.equal('Get it done')
    assert.ok(item.id)
  })

  it('adds initial event', () => {
    const item = Item.new('Get it done')
    expect(item.unpublishedEvents.length).to.equal(1)
    const event = item.unpublishedEvents[0]
    expect(event.name).to.equal('Created')
    expect(event.details).to.eql({
      type: ItemType.Task,
      title: 'Get it done',
    })
  })

  it('can be completed', () => {
    const item = Item.new('Get it done')
    item.complete()
    expect(item.progress).to.equal(Progress.completed)
  })

  it('adds event when completed', () => {
    const item = Item.new('')
    item.unpublishedEvents = []
    item.complete()
    expect(item.unpublishedEvents.length).to.equal(1)

    const event = item.unpublishedEvents[0]
    expect(event.name).to.equal('ProgressChanged')
    expect(event.details).to.eql({ progress: Progress.completed })
  })

  it('can be assigned', () => {
    const item = Item.new('Get it done')
    item.assign('Kenny Starfighter')
    expect(item.progress).to.equal(Progress.inProgress)
    expect(item.assignee).to.equal('Kenny Starfighter')
  })

  it('adds event when assigned', () => {
    const item = Item.new('')
    item.unpublishedEvents = []
    item.assign('Johan')
    expect(item.unpublishedEvents.length).to.equal(2)

    const event0 = item.unpublishedEvents[0]
    expect(event0.name).to.equal('AssigneeChanged')
    expect(event0.details).to.eql({ assignee: 'Johan' })

    const event1 = item.unpublishedEvents[1]
    expect(event1.name).to.equal('ProgressChanged')
    expect(event1.details).to.eql({ progress: Progress.inProgress })
  })

  it('can be promoted to story', () => {
    const item = Item.new('Get it done')
    expect(item.type).to.equal(ItemType.Task)

    item.promote()
    expect(item.type).to.equal(ItemType.Story)
  })

  it('adds event when promoted', () => {
    const item = Item.new('')
    item.unpublishedEvents = []
    item.promote()
    expect(item.unpublishedEvents.length).to.equal(1)

    const event = item.unpublishedEvents[0]
    expect(event.name).to.equal('TypeChanged')
    expect(event.details).to.eql({ type: ItemType.Story })
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
