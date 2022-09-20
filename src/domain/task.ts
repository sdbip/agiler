import { randomUUID } from 'crypto'

export class Task {
  readonly id: string
  isCompleted: boolean
  title: string

  private constructor(id: string, props: TaskProps) {
    this.id = id
    this.isCompleted = props.isCompleted
    this.title = props.title
  }

  complete() {
    this.isCompleted = true
  }

  static new(title: string): Task {
    return new Task(randomUUID(),
    {
      isCompleted: false,
      title,
    })
  }
  static reconstitute(id: string, props: TaskProps): Task {
    return new Task(id, props)
  }
}

export interface TaskProps {
  title: string
  isCompleted: boolean  
}
