import { expect } from 'chai'
import { Progress } from '../../src/domain/item'
import { reconstituteStory, reconstituteTask } from './reconstitute'

describe('Item.complete', () => {

  it('completes the task', () => {
    const task = reconstituteTask('id')
    task.complete()
    const event = task.unpublishedEvents.find(e => e.name === 'ProgressChanged')
    expect(event?.details.progress).to.equal(Progress.completed)
  })

  it('throws if not a task', () => {
    const story = reconstituteStory('id')
    expect(() => story.complete()).to.throw()
    expect(story.unpublishedEvents).to.have.lengthOf(0)
  })
})
