export class Task {
  isCompleted: boolean
  title: string

  constructor(title: string) {
    this.isCompleted = false
    this.title = title
  }

  complete() {
    this.isCompleted = true
  }
}
