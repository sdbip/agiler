import { randomUUID } from 'crypto'

export class Task {
  readonly id: string
  isCompleted: boolean
  title: string

  constructor(props: string | TaskProps) {
    if (typeof props === 'string') {
      this.id = randomUUID()
      this.isCompleted = false
      this.title = props
    } else {
      this.id = props.id
      this.isCompleted = props.isCompleted
      this.title = props.title
    }
  }

  complete() {
    this.isCompleted = true
  }
}

export interface TaskProps {
  id: string;
  title: string
  isCompleted: boolean  
}
