import { expect } from 'chai'
import { Progress } from '../../src/domain/item'
import { reconstituteStory, reconstituteTask } from './reconstitute'

describe('Item.assign', () => {

  it('assignes task to a team member', () => {
    const task = reconstituteTask('id')
    task.assign('Johan')

    const event = task.unpublishedEvents.find(e => e.name === 'AssigneeChanged')
    expect(event?.details.assignee).to.equal('Johan')
  })

  it('is started when assigned', () => {
    const task = reconstituteTask('id')
    task.assign('Johan')

    const event = task.unpublishedEvents.find(e => e.name === 'ProgressChanged')
    expect(event?.details.progress).to.equal(Progress.inProgress)
  })

  it('throws if not a task', () => {
    const story = reconstituteStory('id')

    expect(() => story.assign('Johan')).to.throw()
    expect(story.unpublishedEvents).to.have.lengthOf(0)
  })
})
