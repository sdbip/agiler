import pg from 'pg'

export default class PGDatabase {
  client: pg.Client

  private constructor(client: pg.Client) {
    this.client = client
  }

  static async connect(database: string) {
    const client = new pg.Client({ database })
    await client.connect()
    return new PGDatabase(client)
  }

  async close() {
    await this.client.end()
  }
}
