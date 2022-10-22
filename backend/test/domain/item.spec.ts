import { expect } from 'chai'
import { Progress, Item, ItemType } from '../../src/domain/item'
import { EntityVersion } from '../../src/es/source'

describe('Item', () => {

  it('is NotSaved when created', () => {
    const item = Item.new('Get it done')
    expect(item.version).to.equal(EntityVersion.NotSaved)
  })

  it('adds Created event', () => {
    const item = Item.new('Get it done')
    expect(item.unpublishedEvents.length).to.equal(1)
    const event = item.unpublishedEvents[0]
    expect(event.name).to.equal('Created')
    expect(event.details).to.eql({
      type: ItemType.Task,
      title: 'Get it done',
    })
  })

  it('can be reconstituted from Created event', () => {
    const original = Item.new('Get it done')

    const item = Item.reconstitute('item', EntityVersion.NotSaved, original.unpublishedEvents)
    expect(item.progress).to.equal(Progress.notStarted)
    expect(item.title).to.equal('Get it done')
    expect(item.itemType).to.equal(ItemType.Task)
  })

  it('adds event when completed', () => {
    const item = Item.reconstitute('id', EntityVersion.NotSaved, [])
    item.complete()
    expect(item.unpublishedEvents.length).to.equal(1)

    const event = item.unpublishedEvents[0]
    expect(event.name).to.equal('ProgressChanged')
    expect(event.details).to.eql({ progress: Progress.completed })
  })

  it('can be reconstituted as completed', () => {
    const original = Item.reconstitute('id', EntityVersion.NotSaved, [])
    original.complete()

    const item = Item.reconstitute('id', EntityVersion.NotSaved, original.unpublishedEvents)
    expect(item.progress).to.equal(Progress.completed)
  })

  it('adds event when assigned', () => {
    const item = Item.reconstitute('id', EntityVersion.NotSaved, [])
    item.assign('Johan')
    expect(item.unpublishedEvents.length).to.equal(2)

    const event0 = item.unpublishedEvents[0]
    expect(event0.name).to.equal('AssigneeChanged')
    expect(event0.details).to.eql({ assignee: 'Johan' })

    const event1 = item.unpublishedEvents[1]
    expect(event1.name).to.equal('ProgressChanged')
    expect(event1.details).to.eql({ progress: Progress.inProgress })
  })

  it('can be assigned', () => {
    const original = Item.reconstitute('id', EntityVersion.NotSaved, [])
    original.assign('Kenny Starfighter')

    const item = Item.reconstitute('id', EntityVersion.NotSaved, original.unpublishedEvents)
    expect(item.assignee).to.equal('Kenny Starfighter')
  })

  it('adds event when promoted', () => {
    const item = Item.reconstitute('id', EntityVersion.NotSaved, [])
    item.promote()
    expect(item.unpublishedEvents.length).to.equal(1)

    const event = item.unpublishedEvents[0]
    expect(event.name).to.equal('TypeChanged')
    expect(event.details).to.eql({ type: ItemType.Story })
  })

  it('can be reconstituted as story', () => {
    const original = Item.reconstitute('id', EntityVersion.NotSaved, [])
    original.promote()

    const item = Item.reconstitute('id', EntityVersion.NotSaved, original.unpublishedEvents)

    expect(item.itemType).to.equal(ItemType.Story)
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
