import { randomUUID } from 'crypto'

export class Task {
  readonly id: string
  state: TaskState
  
  get title(): string { return this.state.title }
  get progress() { return this.state.progress }
  get assignee(): string | null { return this.state.assignee }

  complete() {
    this.state.progress = Progress.completed
  }
  assign(member: string) {
    this.state.assignee = member
    this.state.progress = Progress.inProgress
  }

  static new(title: string): Task {
    return new Task(randomUUID(),
    {
      title,
      assignee: null,
      progress: Progress.notStarted,
    })
  }

  static reconstitute(id: string, state: TaskState): Task {
    return new Task(id, state)
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
