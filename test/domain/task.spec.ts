import { expect } from 'chai'
import { Task } from '../../src/domain/task'

describe('Task', () => {
  it('has expected initial values', () => {
    const task = new Task('Get it done')
    expect(task.isCompleted).to.equal(false)
    expect(task.title).to.equal('Get it done')
  })

  it('can be completed', () => {
    const task = new Task('Get it done')
    task.complete()
    expect(task.isCompleted).to.equal(true)
  })
})
