import { assert, expect } from 'chai'
import { Progress, Item, ItemType } from '../../src/domain/item'

describe('Item', () => {
  it('has expected initial values', () => {
    const task = Item.new('Get it done')
    expect(task.progress).to.equal(Progress.notStarted)
    expect(task.title).to.equal('Get it done')
    assert.ok(task.id)
  })

  it('can be completed', () => {
    const task = Item.new('Get it done')
    task.complete()
    expect(task.progress).to.equal(Progress.completed)
  })

  it('can be assigned', () => {
    const task = Item.new('Get it done')
    task.assign('Kenny Starfighter')
    expect(task.progress).to.equal(Progress.inProgress)
    expect(task.assignee).to.equal('Kenny Starfighter')
  })

  it('can be promoted to story', () => {
    const task = Item.new('Get it done')
    expect(ItemType[task.type]).to.equal(ItemType[ItemType.Task])

    task.promote()
    expect(ItemType[task.type]).to.equal(ItemType[ItemType.Story])
  })

  it('has a unique id', () => {
    const task1 = Item.new('Get it done')
    const task2 = Item.new('Get it done')

    expect(task1.id).not.to.equal(task2.id)
  })

  it('has a uuid id', () => {
    const task = Item.new('Get it done')

    expect(task.id).to.match(/^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/)
    expect(task.id).to.match(/^[0-9a-f-]*$/)
  })
})
