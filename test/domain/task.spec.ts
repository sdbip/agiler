import { assert, expect } from 'chai'
import { Task } from '../../src/domain/task'

describe('Task', () => {
  it('has expected initial values', () => {
    const task = new Task('Get it done')
    expect(task.isCompleted).to.equal(false)
    expect(task.title).to.equal('Get it done')
    assert.ok(task.id)
  })

  it('can be completed', () => {
    const task = new Task('Get it done')
    task.complete()
    expect(task.isCompleted).to.equal(true)
  })

  it('has a unique id', () => {
    const task1 = new Task('Get it done')
    const task2 = new Task('Get it done')

    expect(task1.id).not.to.equal(task2.id)
  })

  it('has a uuid id', () => {
    const task = new Task('Get it done')

    expect(task.id).to.match(/^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/)
    expect(task.id).to.match(/^[0-9a-f-]*$/)
  })
})
