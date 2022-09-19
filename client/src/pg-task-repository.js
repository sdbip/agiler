import pg from 'pg'

class PGTaskRepository {
  constructor(database) {
    this.client = new pg.Client({ database })
  }

  async getAll() {
    const res = await this.client.query('SELECT * FROM Tasks')
    return res.rows
  }

  async add(task) {
    await this.client.query('INSERT INTO Tasks VALUES ($1)', [ task.title ])
  }
}

export async function connect(database) {
  const repository = new PGTaskRepository(database)
  await repository.client.connect()
  return repository
}
