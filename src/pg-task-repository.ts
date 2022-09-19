import pg from 'pg'
import { TaskRepository } from './backend'

class PGTaskRepository implements TaskRepository {
  private client: pg.Client

  constructor(client: pg.Client) {
    this.client = client
  }

  async getAll() {
    const res = await this.client.query('SELECT * FROM Tasks')
    return res.rows
  }

  async add(task: any) {
    await this.client.query('INSERT INTO Tasks VALUES ($1)', [ task.title ])
  }
}

export async function connect(database: string) {
  const client = new pg.Client({ database })
  await client.connect()

  return new PGTaskRepository(client)
}
