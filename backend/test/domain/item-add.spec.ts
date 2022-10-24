import { expect } from 'chai'
import { reconstituteStory, reconstituteTask, reconstituteTaskWithParent } from './reconstitute'

describe('Item.add', () => {

  it('adds a Task to a Story', () => {
    const story = reconstituteStory('story_id')
    const task = reconstituteTask('task_id')
    story.add(task)
    const event = story.unpublishedEvents.find(e => e.name === 'ChildrenAdded')
    expect(event?.details.children).to.deep.equal([ task.id ])
  })

  it('sets the parent of a Task', () => {
    const story = reconstituteStory('story_id')
    const task = reconstituteTask('task_id')
    story.add(task)
    const event = task.unpublishedEvents.find(e => e.name === 'ParentChanged')
    expect(event?.details.parent).to.equal(story.id)
  })

  it('throws if the Task already has a parent', () => {
    const story = reconstituteStory('story_id')
    const task = reconstituteTaskWithParent('other_story', 'task_id')
    expect(() => story.add(task)).to.throw()
    expect(story.unpublishedEvents).to.have.lengthOf(0)
    expect(task.unpublishedEvents).to.have.lengthOf(0)
  })

  it('throws if parent is not a Story', () => {
    const task1 = reconstituteTask('id')
    const task2 = reconstituteTask('id')
    expect(() => task1.add(task2)).to.throw()
    expect(task1.unpublishedEvents).to.have.lengthOf(0)
    expect(task2.unpublishedEvents).to.have.lengthOf(0)
  })

  it('throws if added item is not a Task', () => {
    const task = reconstituteTask('id')
    const story = reconstituteStory('id')
    expect(() => task.add(story)).to.throw()
    expect(task.unpublishedEvents).to.have.lengthOf(0)
    expect(story.unpublishedEvents).to.have.lengthOf(0)
  })
})
