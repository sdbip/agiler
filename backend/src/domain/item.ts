import { randomUUID } from 'crypto'
import { failFast } from '../es/failFast.js'
import { Entity, CanonicalEntityId, EntityVersion, UnpublishedEvent } from '../es/source.js'

export enum ItemType {
  Task = 'Task',
  Story = 'Story',
}

export class Item extends Entity {
  itemType = ItemType.Task
  
  promote() {
    failFast.unless(this.itemType === ItemType.Task, `Only ${ItemType.Task} items may be promoted`)

    this.itemType = ItemType.Story
    this.addEvent({ name: 'TypeChanged', details: { type: ItemType.Story } })
  }
  complete() {
    failFast.unless(this.itemType === ItemType.Task, `Only ${ItemType.Task} items may be assigned`)

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

  static reconstitute(id: string, version: EntityVersion, events: UnpublishedEvent[]) {
    const item = new Item(id, version)
    for (const event of events) {
      switch (event.name) {
      case 'Created':
        item.itemType = event.details.type
        break
      case 'ProgressChanged':
      case 'AssigneeChanged':
        break
      case 'TypeChanged':
        item.itemType = event.details.type
        break
      }
    }
    return item
  }

  private constructor(id: string, version: EntityVersion) { super(new CanonicalEntityId(id, 'Item'), version) }
}

export enum Progress {
  notStarted = 'notStarted',
  inProgress = 'inProgress',
  completed = 'completed',
}
