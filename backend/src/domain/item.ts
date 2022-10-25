import { randomUUID } from 'crypto'
import { failFast } from '../../../shared/src/failFast.js'
import { Entity, CanonicalEntityId, EntityVersion, UnpublishedEvent, PublishedEvent } from '../es/source.js'

export enum ItemType {
  Task = 'Task',
  Story = 'Story',
}

export class Item extends Entity {
  itemType = ItemType.Task
  parent?: string

  promote() {
    failFast.unless(this.itemType === ItemType.Task, `Only ${ItemType.Task} items may be promoted`)

    this.itemType = ItemType.Story
    this.addEvent({ name: 'TypeChanged', details: { type: ItemType.Story } })
  }

  add(task: Item) {
    failFast.unless(this.itemType === ItemType.Story, `Only ${ItemType.Story} items may have children`)
    failFast.unless(task.itemType === ItemType.Task, `Only ${ItemType.Task} items may be added`)
    failFast.unless(task.parent === undefined, 'Task must not have other parent')

    this.addEvent(new UnpublishedEvent('ChildrenAdded', { children: [ task.id ] }))

    task.removeEventMatching(e => e.name === 'ParentChanged')
    task.addEvent(new UnpublishedEvent('ParentChanged', { parent: this.id }))
  }

  remove(task: Item) {
    if (task.parent !== this.id) return
    task.parent = undefined
    this.addEvent(new UnpublishedEvent('ChildrenRemoved', { children: [ task.id ] }))
    task.addEvent(new UnpublishedEvent('ParentChanged', { parent: null }))
  }

  complete() {
    failFast.unless(this.itemType === ItemType.Task, `Only ${ItemType.Task} items may be completed`)

    this.addEvent({ name: 'ProgressChanged', details: { progress: Progress.completed } })
  }

  assign(member: string) {
    failFast.unless(this.itemType === ItemType.Task, `Only ${ItemType.Task} items may be assigned`)

    this.addEvent({ name: 'AssigneeChanged', details: { assignee: member } })
    this.addEvent({ name: 'ProgressChanged', details: { progress: Progress.inProgress } })
  }

  static new(title: string): Item {
    const item = new Item(randomUUID(), EntityVersion.new)
    item.addEvent({ name: 'Created', details: { title, type: ItemType.Task } })
    return item
  }

  static reconstitute(id: string, version: EntityVersion, events: PublishedEvent[]) {
    const item = new Item(id, version)
    for (const event of events) {
      switch (event.name) {
        case 'Created':
        case 'TypeChanged':
          item.itemType = event.details.type
          break
        case 'ParentChanged':
          item.parent = event.details.parent
          break
        default: break
      }
    }
    return item
  }

  private constructor(id: string, version: EntityVersion) { super(new CanonicalEntityId(id, 'Item'), version) }

  private removeEventMatching(predicate: (e: UnpublishedEvent) => boolean) {
    const existingEvent = this.unpublishedEvents.findIndex(predicate)
    this.unpublishedEvents.splice(existingEvent, 1)
  }
}

export enum Progress {
  notStarted = 'notStarted',
  inProgress = 'inProgress',
  completed = 'completed',
}
