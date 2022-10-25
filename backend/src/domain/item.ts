import { randomUUID } from 'crypto'
import { failFast } from '../../../shared/src/failFast.js'
import { Entity, CanonicalEntityId, EntityVersion, UnpublishedEvent } from '../es/source.js'

export enum ItemType {
  Task = 'Task',
  Story = 'Story',
}

export class Item extends Entity {
  itemType = ItemType.Task
  parent?: string

  promote() {
    this.failFastUnlessTask()

    this.itemType = ItemType.Story
    this.addEvent({ name: 'TypeChanged', details: { type: ItemType.Story } })
  }

  add(task: Item) {
    failFast.unless(this.itemType === ItemType.Story, `Only ${ItemType.Story} items may have children`)
    task.failFastUnlessTask()
    failFast.unless(task.parent === undefined, 'Task must not have other parent')

    this.addEvent(new UnpublishedEvent('ChildrenAdded', { children: [ task.id ] }))
    task.addEvent(new UnpublishedEvent('ParentChanged', { parent: this.id }))
  }

  remove(task: Item) {
    if (task.parent !== this.id) return
    this.addEvent(new UnpublishedEvent('ChildrenRemoved', { children: [ task.id ] }))
    task.addEvent(new UnpublishedEvent('ParentChanged', { parent: null }))
  }

  complete() {
    this.failFastUnlessTask()

    this.addEvent({ name: 'ProgressChanged', details: { progress: Progress.completed } })
  }

  assign(member: string) {
    this.failFastUnlessTask()

    this.addEvent({ name: 'AssigneeChanged', details: { assignee: member } })
    this.addEvent({ name: 'ProgressChanged', details: { progress: Progress.inProgress } })
  }

  static new(title: string): Item {
    const item = new Item(randomUUID(), EntityVersion.new)
    item.addEvent({ name: 'Created', details: { title, type: ItemType.Task } })
    return item
  }

  static reconstitute(id: string, version: EntityVersion, events: UnpublishedEvent[]) {
    const item = new Item(id, version)
    for (const event of events) {
      const details = JSON.parse(event.details)
      switch (event.name) {
        case 'Created':
        case 'TypeChanged':
          item.itemType = details.type
          break
        case 'ParentChanged':
          item.parent = details.parent
          break
        default: break
      }
    }
    return item
  }

  private constructor(id: string, version: EntityVersion) { super(new CanonicalEntityId(id, 'Item'), version) }

  private failFastUnlessTask() {
    const type = ItemType.Task
    failFast.unless(this.itemType === type, `Only ${type} items may be promoted`)
  }
}

export enum Progress {
  notStarted = 'notStarted',
  inProgress = 'inProgress',
  completed = 'completed',
}
