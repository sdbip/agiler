import { assert } from 'chai'
import { Item } from '../../src/domain/item'
import { reconstituteStory, reconstituteStoryWithChildren, reconstituteTask, reconstituteTaskWithParent } from './reconstitute'

describe('Item.add', () => {

  it('adds a Task to a Story', () => {
    const story = reconstituteStory('story_id')
    const task = reconstituteTask('task_id')
    story.add(task)
    const event = story.unpublishedEvents.find(e => e.name === 'ChildrenAdded')
    assert.deepEqual(event?.details.children, [ task.id ])
  })

  it('sets the parent of a Task', () => {
    const story = reconstituteStory('story_id')
    const task = reconstituteTask('task_id')
    story.add(task)
    const event = task.unpublishedEvents.find(e => e.name === 'ParentChanged')
    assert.equal(event?.details.parent, story.id)
  })

  it('only updates parent once', () => {
    const taskId = 'task_id'
    const oldParentId = 'old_parent_id'
    const newParentId = 'new_parent_id'

    const task = reconstituteTaskWithParent(oldParentId, taskId)
    const oldParent = reconstituteStoryWithChildren([ taskId ], oldParentId)
    oldParent.remove(task)

    const newParent = reconstituteStory(newParentId)
    newParent.add(task)

    const events = task.unpublishedEvents.filter(e => e.name === 'ParentChanged')
    assert.lengthOf(events, 1)
  })

  it('doesn\'t remove "Created" event', () => {
    const storyId = 'story_id'

    const task = Item.new('New task')
    const story = reconstituteStory(storyId)
    story.add(task)

    const events = task.unpublishedEvents.filter(e => e.name === 'Created')
    assert.lengthOf(events, 1)
  })

  it('sets the last parent', () => {
    const taskId = 'task_id'
    const oldParentId = 'old_parent_id'
    const newParentId = 'new_parent_id'

    const task = reconstituteTaskWithParent(oldParentId, taskId)
    const oldParent = reconstituteStoryWithChildren([ taskId ], oldParentId)
    oldParent.remove(task)

    const newParent = reconstituteStory(newParentId)
    newParent.add(task)

    const event = task.unpublishedEvents.find(e => e.name === 'ParentChanged')
    assert.equal(event?.details.parent, newParentId)
  })

  it('throws if the Task already has a parent', () => {
    const story = reconstituteStory('story_id')
    const task = reconstituteTaskWithParent('other_story', 'task_id')
    assert.throws(() => story.add(task))
    assert.lengthOf(story.unpublishedEvents, 0)
    assert.lengthOf(task.unpublishedEvents, 0)
  })

  it('throws if parent is not a Story', () => {
    const task1 = reconstituteTask('task1_id')
    const task2 = reconstituteTask('task2_id')
    assert.throws(() => task1.add(task2))
    assert.lengthOf(task1.unpublishedEvents, 0)
    assert.lengthOf(task2.unpublishedEvents, 0)
  })

  it('throws if added item is not a Task', () => {
    const task = reconstituteTask('task_id')
    const story = reconstituteStory('story_id')
    assert.throws(() => task.add(story))
    assert.lengthOf(task.unpublishedEvents, 0)
    assert.lengthOf(story.unpublishedEvents, 0)
  })
})
