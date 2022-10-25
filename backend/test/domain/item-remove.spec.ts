import { expect } from 'chai'
import { reconstituteStory, reconstituteStoryWithChildren, reconstituteTask, reconstituteTaskWithParent } from './reconstitute'

describe('Item.remove', () => {

  it('removes a Task from a Story', () => {
    const story = reconstituteStoryWithChildren([ 'task_id' ], 'story_id')
    const task = reconstituteTaskWithParent('story_id', 'task_id')
    story.remove(task)
    const event = story.unpublishedEvents.find(e => e.name === 'ChildrenRemoved')
    expect(event?.details.children).to.deep.equal([ task.id ])
  })

  it('unsets the Task\'s parent', () => {
    const story = reconstituteStoryWithChildren([ 'task_id' ], 'story_id')
    const task = reconstituteTaskWithParent('story_id', 'task_id')
    story.remove(task)
    const event = task.unpublishedEvents.find(e => e.name === 'ParentChanged')
    expect(event?.details.parent).to.equal(null)
  })

  it('ignores tasks that are not children', () => {
    const story = reconstituteStory('story_id')
    const task = reconstituteTask('task_id')
    story.remove(task)
    expect(story.unpublishedEvents).to.have.lengthOf(0)
    expect(task.unpublishedEvents).to.have.lengthOf(0)
  })
})
