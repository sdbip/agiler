import { expect } from 'chai'
import { promises as fs } from 'fs'
import { PGEventRepository } from '../../src/pg/pg-event-repository'
import { PGDatabase } from '../../src/pg/pg-database'

describe(PGEventRepository.name, () => {
  let repository: PGEventRepository
  let database: PGDatabase
  
  beforeEach(async () => {
    const databaseName = process.env['TEST_DATABASE_NAME']
    if (!databaseName) expect.fail('The environment variable TEST_DATABASE_NAME must be set')
    
    database = await PGDatabase.connect(databaseName)
    repository = new PGEventRepository(database)  

    const schemaDDL = await fs.readFile('./schema/schema.sql')
    await database.query('DROP TABLE IF EXISTS Events;DROP TABLE IF EXISTS Entities')
    await database.query(schemaDDL.toString('utf-8'))
  })

  afterEach(async () => {
    database.close()
  })

  it('finds stored events', async () => {
    database.query('INSERT INTO Entities VALUES ($1, $2, $3)', [ 'id', 'type', 0 ])
    database.query('INSERT INTO Events VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [ 'id', 'type', 'event', '{"test":"value"}', 'actor', 0, 0, 0 ])

    const history = await repository.getHistoryFor('id')
    expect(history?.events[0]).to.deep.equal({
      name: 'event',
      details: { test: 'value' },
    })
  })

  it('returns null if the entity does not exist', async () => {
    const history = await repository.getHistoryFor('id')
    expect(history).to.equal(null)
  })
})
