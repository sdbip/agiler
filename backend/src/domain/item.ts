import { randomUUID } from 'crypto'
import { Entity, CanonicalEntityId, EntityVersion, UnpublishedEvent } from '../es/source.js'

export enum ItemType {
  Task = 'Task',
  Story = 'Story',
}

export class Item extends Entity {
  state: TaskState = { title: '', assignee: null, progress: Progress.notStarted }
  itemType = ItemType.Task
  
  get title(): string { return this.state.title }
  get progress() { return this.state.progress }
  get assignee(): string | null { return this.state.assignee }

  promote() {
    this.itemType = ItemType.Story
    this.addEvent({ name: 'TypeChanged', details: { type: ItemType.Story } })
  }
  complete() {
    this.state.progress = Progress.completed
    this.addEvent({ name: 'ProgressChanged', details: { progress: Progress.completed } })
  }
  assign(member: string) {
    this.state.assignee = member
    this.state.progress = Progress.inProgress
    this.addEvent({ name: 'AssigneeChanged', details: { assignee: member } })
    this.addEvent({ name: 'ProgressChanged', details: { progress: Progress.inProgress } })
  }

  static new(title: string): Item {
    const item = new Item(randomUUID(), EntityVersion.NotSaved)
    item.addEvent({ name: 'Created', details: { title, type: ItemType.Task } })
    item.state.title = title
    return item
  }

  static reconstitute(id: string, version: EntityVersion, events: UnpublishedEvent[]) {
    const item = new Item(id, version)
    for (const event of events) {
      switch (event.name) {
      case 'Created':
        item.state.title = event.details.title
        item.itemType = event.details.type
        break
      case 'ProgressChanged':
        item.state.progress = event.details.progress
        break
      case 'AssigneeChanged':
        item.state.assignee = event.details.assignee
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

export interface TaskState {
  title: string
  assignee: string | null
  progress: Progress
}

export enum Progress {
  notStarted = 'notStarted',
  inProgress = 'inProgress',
  completed = 'completed',
}
