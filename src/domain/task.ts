import { randomUUID } from 'crypto'

export class Task {
  readonly id: string
  isCompleted: boolean
  title: string

  constructor(title: string) {
    this.id = randomUUID()
    this.isCompleted = false
    this.title = title
  }

  complete() {
    this.isCompleted = true
  }
}
