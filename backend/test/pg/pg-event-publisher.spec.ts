import { expect } from 'chai'
import { promises as fs } from 'fs'
import { PGEventPublisher } from '../../src/pg/pg-event-publisher'
import { PGDatabase } from '../../src/pg/pg-database'
import { Event } from '../../src/es'

describe(PGEventPublisher.name, () => {
  let publisher: PGEventPublisher
  let database: PGDatabase
  
  before(async () => {
    const databaseName = process.env['TEST_DATABASE_NAME']
    if (!databaseName) expect.fail('The environment variable TEST_DATABASE_NAME must be set')
    
    database = await PGDatabase.connect(databaseName)
    publisher = new PGEventPublisher(database)  

    const tasks = await fs.readFile('./schema/schema.sql')
    await database.query('DROP TABLE IF EXISTS Events;DROP TABLE IF EXISTS Entities')
    await database.query(tasks.toString('utf-8'))
  })

  after(async () => {
    database.close()
  })

  it('can publish events for new entities', async () => {
    const event: Event = {
      name: 'TestEvent',
      details: { value: 1 },
    }
    await publisher.publish([ event ], { id: 'new_entity', type: 'Item' })

    const res = await database.query(
      'SELECT * FROM Events WHERE entity_id = $1',
      [ 'new_entity' ])
    expect(res.rows[0]).to.exist
    expect(res.rows[0]).to.deep.include({ entity_id: 'new_entity', name: 'TestEvent', details: '{"value":1}' })
  })

  it('can publish events for existing entities', async () => {
    await database.query(
      'INSERT INTO Entities VALUES ($1, $2, $3)',
      [ 'existing_entity', 'type', 0 ])

    const event: Event = {
      name: 'TestEvent',
      details: { value: 1 },
    }
    await publisher.publish([ event ], { id: 'existing_entity', type: 'Item' })

    const res = await database.query(
      'SELECT * FROM Events WHERE entity_id = $1',
      [ 'existing_entity' ])
    expect(res.rows[0]).to.exist
    expect(res.rows[0]).to.deep.include({ entity_id: 'existing_entity', name: 'TestEvent', details: '{"value":1}' })
  })
})
