import { assert, expect } from 'chai'
import { Progress, Task } from '../../src/domain/task'

describe('Task', () => {
  it('has expected initial values', () => {
    const task = Task.new('Get it done')
    expect(task.progress).to.equal(Progress.notStarted)
    expect(task.title).to.equal('Get it done')
    assert.ok(task.id)
  })

  it('can be completed', () => {
    const task = Task.new('Get it done')
    task.complete()
    expect(task.progress).to.equal(Progress.completed)
  })

  it('can be started', () => {
    const task = Task.new('Get it done')
    task.start()
    expect(task.progress).to.equal(Progress.inProgress)
  })

  it('has a unique id', () => {
    const task1 = Task.new('Get it done')
    const task2 = Task.new('Get it done')

    expect(task1.id).not.to.equal(task2.id)
  })

  it('has a uuid id', () => {
    const task = Task.new('Get it done')

    expect(task.id).to.match(/^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/)
    expect(task.id).to.match(/^[0-9a-f-]*$/)
  })
})
