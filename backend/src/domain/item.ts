import { randomUUID } from 'crypto'

export enum ItemType {
  Task,
  Story,
}

export class Item {
  readonly id: string
  state: TaskState
  type = ItemType.Task
  
  get title(): string { return this.state.title }
  get progress() { return this.state.progress }
  get assignee(): string | null { return this.state.assignee }

  promote() {
    this.type = ItemType.Story
  }
  complete() {
    this.state.progress = Progress.completed
  }
  assign(member: string) {
    this.state.assignee = member
    this.state.progress = Progress.inProgress
  }

  static new(title: string): Item {
    return new Item(randomUUID(),
    {
      title,
      assignee: null,
      progress: Progress.notStarted,
    })
  }

  static reconstitute(id: string, state: TaskState): Item {
    return new Item(id, state)
  }

  private constructor(id: string, state: TaskState) {
    this.id = id
    this.state = state
  }
}

export interface TaskState {
  title: string
  assignee: string | null
  progress: Progress
}

export enum Progress {
  notStarted,
  inProgress,
  completed
}
