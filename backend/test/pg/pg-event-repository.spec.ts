import { expect } from 'chai'
import { promises as fs } from 'fs'
import { PGEventRepository } from '../../src/pg/pg-event-repository'
import { PGDatabase } from '../../src/pg/pg-database'

describe(PGEventRepository.name, () => {
  let repository: PGEventRepository
  let database: PGDatabase
  
  before(async () => {
    const databaseName = process.env['TEST_DATABASE_NAME']
    if (!databaseName) expect.fail('The environment variable TEST_DATABASE_NAME must be set')
    
    database = await PGDatabase.connect(databaseName)
    repository = new PGEventRepository(database)  

    const schema = await fs.readFile('./schema/schema.sql')
    await database.query('DROP TABLE IF EXISTS Events;DROP TABLE IF EXISTS Entities')
    await database.query(schema.toString('utf-8'))
  })

  after(async () => {
    database.close()
  })

  it('finds stored events', async () => {
    database.query('INSERT INTO Entities VALUES ($1, $2, $3)', [ 'id', 'type', 0 ])
    database.query('INSERT INTO Events VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [ 'id', 'type', 'event', '{"test":"value"}', 'actor', 0, 0, 0 ])

    const events = await repository.getEvents('id')
    expect(events[0]).to.eql({
      name: 'event',
      details: { test: 'value' },
    })
  })
})
