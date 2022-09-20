import { randomUUID } from 'crypto'

export class Task {
  readonly id: string
  state: TaskState
  
  get isCompleted(): boolean { return this.state.isCompleted }
  get title(): string { return this.state.title }
  
  complete() {
    this.state.isCompleted = true
  }

  static new(title: string): Task {
    return new Task(randomUUID(),
    {
      isCompleted: false,
      title,
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
  isCompleted: boolean  
}
