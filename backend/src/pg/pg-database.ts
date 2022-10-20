import pg from 'pg'

export class PGDatabase {
  private client: pg.Client

  private constructor(client: pg.Client) {
    this.client = client
  }

  static async connect(database: string): Promise<PGDatabase> {
    const client = new pg.Client({ database })
    await client.connect()
    return new PGDatabase(client)
  }

  query(sql: string, args?: any[]) {
    return this.client.query(sql, args)
  }

  async close() {
    await this.client.end()
  }
}
