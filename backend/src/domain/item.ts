import { randomUUID } from 'crypto'
import { Event } from '../es'

export enum ItemType {
  Task = 'Task',
  Story = 'Story',
}

export class Item {
  readonly id: string
  readonly unpublishedEvents: Event[] = []
  state: TaskState = { title: '', assignee: null, progress: Progress.notStarted }
  type = ItemType.Task
  
  get title(): string { return this.state.title }
  get progress() { return this.state.progress }
  get assignee(): string | null { return this.state.assignee }

  promote() {
    this.type = ItemType.Story
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
    const item = new Item(randomUUID())
    item.addEvent({ name: 'Created', details: { title, type: ItemType.Task } })
    item.state.title = title
    return item
  }

  static reconstitute(id: string, events: Event[]) {
    const item = new Item(id)
    for (const event of events) {
      switch (event.name) {
      case 'Created':
        item.state.title = event.details.title
        item.type = event.details.type
        break
      case 'ProgressChanged':
        item.state.progress = event.details.progress
        break
      case 'AssigneeChanged':
        item.state.assignee = event.details.assignee
        break
      case 'TypeChanged':
        item.type = event.details.type
        break
      }
    }
    return item
  }

  private addEvent(event: Event) {
    this.unpublishedEvents.push(event)
  }

  private constructor(id: string) { this.id = id }
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
