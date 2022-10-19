import { randomUUID } from 'crypto'
import { UnpublishedEvent } from './unpublished_event'

export enum ItemType {
  Task = 'Task',
  Story = 'Story',
}

export class Item {
  readonly id: string
  state: TaskState
  type = ItemType.Task
  unpublishedEvents: UnpublishedEvent[] = []
  
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
    const item = new Item(randomUUID(), ItemType.Task,
      {
        title,
        assignee: null,
        progress: Progress.notStarted,
      })
    item.addEvent({ name: 'Created', details: { title, type: ItemType.Task } })
    return item
  }

  static reconstitute(id: string, type: ItemType, state: TaskState): Item {
    return new Item(id, type, state)
  }

  private addEvent(event: UnpublishedEvent) {
    this.unpublishedEvents.push(event)
  }

  private constructor(id: string, type: ItemType, state: TaskState) {
    this.id = id
    this.type = type
    this.state = state
  }
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
