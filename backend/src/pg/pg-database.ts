import pg from 'pg'

pg.types.setTypeParser(pg.types.builtins.INT8, (value: string) => {
  return parseInt(value)
})

pg.types.setTypeParser(pg.types.builtins.FLOAT8, (value: string) => {
   return parseFloat(value)
})

pg.types.setTypeParser(pg.types.builtins.NUMERIC, (value: string) => {
   return parseFloat(value)
})

export class PGDatabase {
  private constructor(readonly client: pg.Client) { }

  static async connect(database: string): Promise<PGDatabase> {
    const client = new pg.Client({ database })
    await client.connect()
    return new PGDatabase(client)
  }

  async transaction(callback: ((_: PGDatabase) => Promise<boolean>)) {
    const transaction = await this.begin()
    try {
      const isSuccess = await callback(this)
      if (isSuccess) transaction.commit()
      else transaction.rollback()
    } catch(err) {
      transaction.rollback()
      throw err
    }
  }

  private async begin() {
    await this.query('begin')
    return new PGTransaction(this.client)
  }

  query(sql: string, args?: any[]) {
    return this.client.query(sql, args)
  }

  async close() {
    await this.client.end()
  }
}

class PGTransaction {
  constructor(readonly client: pg.Client) { }
  commit() {
    return this.client.query('commit')
  }

  rollback() {
    return this.client.query('rollback')
  }
}
