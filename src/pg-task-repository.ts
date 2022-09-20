import pg from 'pg'
import { TaskRepository } from './backend'
import { Progress, Task, TaskState } from './domain/task'

class PGTaskRepository implements TaskRepository {
  private client: pg.Client

  constructor(client: pg.Client) {
    this.client = client
  }

  async getNew() {
    const res = await this.client.query('SELECT * FROM Tasks WHERE progress = $1', [ Progress[Progress.notStarted] ])
    return res.rows.map(task)
  }

  async get(id: string): Promise<Task | undefined> {
    const res = await this.client.query('SELECT * FROM Tasks WHERE id = $1', [ id ])
    return task(res.rows[0])
  }

  async add(task: Task) {
    await this.client.query('INSERT INTO Tasks (id, title, progress) VALUES ($1, $2, $3)', [ task.id, task.title, Progress[task.progress] ])
  }

  async close() {
    await this.client.end()
  }
}

export async function connect(database: string) {
  const client = new pg.Client({ database })
  await client.connect()

  return new PGTaskRepository(client)
}

type TaskRow = {
  id: string
  title: string
  progress: keyof typeof Progress
}

function task(row: TaskRow) {
  const props: TaskState = {
    title: row.title,
    progress: Progress[row.progress],
  }
  return Task.reconstitute(row.id, props)
}
