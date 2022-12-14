import { assert } from 'chai'
import { ItemEvent, Progress } from '../../src/domain/enums'
import { reconstituteStory, reconstituteTask } from './reconstitute'

describe('Item.assign', () => {

  it('assignes task to a team member', () => {
    const task = reconstituteTask('id')
    task.assign('Johan')

    const event = task.unpublishedEvents.find(e => e.name === ItemEvent.AssigneeChanged)
    assert.equal(event?.details.assignee, 'Johan')
  })

  it('is started when assigned', () => {
    const task = reconstituteTask('id')
    task.assign('Johan')

    const event = task.unpublishedEvents.find(e => e.name === ItemEvent.ProgressChanged)
    assert.equal(event?.details.progress, Progress.inProgress)
  })

  it('throws if not a task', () => {
    const story = reconstituteStory('id')

    assert.throws(() => story.assign('Johan'))
    assert.lengthOf(story.unpublishedEvents, 0)
  })
})
