import { assert, expect } from 'chai'
import { promises as fs } from 'fs'
import { PGEventPublisher } from '../../src/pg/pg-event-publisher'
import { PGDatabase } from '../../src/pg/pg-database'
import { Event } from '../../src/es'

describe(PGEventPublisher.name, () => {
  let publisher: PGEventPublisher
  let database: PGDatabase
  
  before(async () => {
    const databaseName = process.env['TEST_DATABASE_NAME']
    if (!databaseName) assert.fail('The environment variable TEST_DATABASE_NAME must be set')
    
    database = await PGDatabase.connect(databaseName)
    publisher = new PGEventPublisher(database)  

    const tasks = await fs.readFile('./schema/schema.sql')
    await database.query('DROP TABLE IF EXISTS Events;DROP TABLE IF EXISTS Entities')
    await database.query(tasks.toString('utf-8'))
  })

  after(async () => {
    database.close()
  })

  it('can publish events', async () => {
    const event: Event = {
      name: 'TestEvent',
      details: { value: 1 },
    }
    await publisher.publish('id', 'Item', [ event ])

    const res = await database.query(
      'SELECT * FROM Events WHERE entity_id = $1',
      [ 'id' ])
    expect(res.rows[0]).to.deep.include({ entity_id: 'id', name: 'TestEvent', details: '{"value":1}' })
  })
})
