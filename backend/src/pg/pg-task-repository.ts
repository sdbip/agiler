import { TaskRepository } from '../backend'
import { Progress, Task, TaskState } from '../domain/task.js'
import PGDatabase from './pg-database'

export default class PGTaskRepository implements TaskRepository {
  private readonly database: PGDatabase

  constructor(database: PGDatabase) {
    this.database = database
  }

  async allWithProgress(progress: Progress) {
    const res = await this.database.query(
      'SELECT * FROM Tasks WHERE progress = $1',
      [ Progress[progress] ])
    return res.rows.map(task)
  }

  async get(id: string): Promise<Task | undefined> {
    const res = await this.database.query(
      'SELECT * FROM Tasks WHERE id = $1',
      [ id ])
    return task(res.rows[0])
  }

  async add(task: Task) {
    await this.database.query(
      'INSERT INTO Tasks (id, title, progress) VALUES ($1, $2, $3)',
      [ task.id, task.title, Progress[task.progress] ])
  }

  async update(task: Task) {
    await this.database.query(
      'UPDATE Tasks SET title = $2, progress = $3 WHERE id = $1',
      [ task.id, task.title, Progress[task.progress] ])
  }
}

type TaskRow = {
  id: string
  title: string
  progress: keyof typeof Progress
}

function task(row: TaskRow) {
  const props: TaskState = {
    title: row.title,
    assignee: null,
    progress: Progress[row.progress],
  }
  return Task.reconstitute(row.id, props)
}