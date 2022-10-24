import { expect } from 'chai'
import { Progress, Item, ItemType } from '../../src/domain/item'
import { EntityVersion, PublishedEvent } from '../../src/es/source'

describe('Item.assign', () => {

  it('assignes task to a team member', () => {
    const item = Item.reconstitute('id', EntityVersion.new, [])
    item.assign('Johan')

    const event = item.unpublishedEvents.find(e => e.name === 'AssigneeChanged')
    expect(event?.details.assignee).to.equal('Johan')
  })

  it('is started when assigned', () => {
    const item = Item.reconstitute('id', EntityVersion.new, [])
    item.assign('Johan')

    const event = item.unpublishedEvents.find(e => e.name === 'ProgressChanged')
    expect(event?.details.progress).to.equal(Progress.inProgress)
  })

  it('throws if not a task', () => {
    const item = Item.reconstitute('id', EntityVersion.new, [
      new PublishedEvent('TypeChanged', JSON.stringify({ type: ItemType.Story })),
    ])

    expect(() => item.assign('Johan')).to.throw()
    expect(item.unpublishedEvents).to.have.lengthOf(0)
  })
})
