import pg from 'pg'
import { TaskRepository } from './backend'
import { Task } from './domain/task'

class PGTaskRepository implements TaskRepository {
  private client: pg.Client

  constructor(client: pg.Client) {
    this.client = client
  }

  async getNew() {
    const res = await this.client.query('SELECT * FROM Tasks WHERE progress = 0')
    return res.rows.map(row => new Task({
      ...row,
      isCompleted: row.progress > 0,
    }))
  }

  async get(id: string): Promise<Task | undefined> {
    const res = await this.client.query('SELECT * FROM Tasks WHERE id = $1', [ id ])
    return new Task({
      ...res.rows[0],
      isCompleted: res.rows[0].progress > 0,
    })
  }

  async add(task: any) {
    await this.client.query('INSERT INTO Tasks (id, title, progress) VALUES ($1, $2, $3)', [ task.id, task.title, task.isCompleted ? 1 : 0 ])
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
