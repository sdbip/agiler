import { expect } from 'chai'
import { promises as fs } from 'fs'
import { PGEventPublisher } from '../../src/pg/pg-event-publisher'
import { PGDatabase } from '../../src/pg/pg-database'
import { Event } from '../../src/es'

describe(PGEventPublisher.name, () => {
  let publisher: PGEventPublisher
  let database: PGDatabase
  
  beforeEach(async () => {
    const databaseName = process.env['TEST_DATABASE_NAME']
    if (!databaseName) expect.fail('The environment variable TEST_DATABASE_NAME must be set')
    
    database = await PGDatabase.connect(databaseName)
    publisher = new PGEventPublisher(database)  

    const tasks = await fs.readFile('./schema/schema.sql')
    await database.query('DROP TABLE IF EXISTS Events;DROP TABLE IF EXISTS Entities')
    await database.query(tasks.toString('utf-8'))
  })

  afterEach(async () => {
    database.close()
  })

  it('can publish events for new entities', async () => {
    const event: Event = {
      name: 'TestEvent',
      details: { value: 1 },
    }
    await publisher.publish([ event ], { id: 'id', type: 'Item' })

    const res = await database.query(
      'SELECT * FROM Events WHERE entity_id = $1',
      [ 'id' ])
    expect(res.rows[0]).to.exist
    expect(res.rows[0]).to.deep.include({ entity_id: 'id', name: 'TestEvent', details: '{"value":1}' })
  })

  it('can publish events for existing entities', async () => {
    await database.query(
      'INSERT INTO Entities VALUES ($1, $2, $3)',
      [ 'id', 'type', 0 ])

    const event: Event = {
      name: 'TestEvent',
      details: { value: 1 },
    }
    await publisher.publish([ event ], { id: 'id', type: 'Item' })

    const res = await database.query(
      'SELECT * FROM Events WHERE entity_id = $1',
      [ 'id' ])
    expect(res.rows[0]).to.exist
    expect(res.rows[0]).to.deep.include({ entity_id: 'id', name: 'TestEvent', details: '{"value":1}' })
  })

  it('sets increasing version number for each event', async () => {
    const event1: Event = {
      name: 'Event1',
      details: { value: 1 },
    }
    const event2: Event = {
      name: 'Event2',
      details: { value: 1 },
    }
    await publisher.publish([ event1, event2 ], { id: 'id', type: 'Item' })

    const res = await database.query(
      'SELECT * FROM Events WHERE entity_id = $1 ORDER BY version',
      [ 'id' ])

    expect(res.rows[0]).to.deep.include({ name: 'Event1', version: 0 })
    expect(res.rows[1]).to.deep.include({ name: 'Event2', version: 1 })
  })

  it('sets the first event\'s version to the current version of the entity', async () => {
    await database.query(
      'INSERT INTO Entities VALUES ($1, $2, $3)',
      [ 'id', 'type', 1 ])

    const event: Event = {
      name: 'Event1',
      details: { value: 1 },
    }
    await publisher.publish([ event ], { id: 'id', type: 'Item' })

    const res = await database.query(
      'SELECT * FROM Events WHERE entity_id = $1',
      [ 'id' ])

    expect(res.rows[0]).to.deep.include({ name: 'Event1', version: 1 })
  })

  it('updates the version of the entity', async () => {
    const event: Event = {
      name: 'Event1',
      details: { value: 1 },
    }
    await publisher.publish([ event ], { id: 'id', type: 'Item' })

    const res = await database.query(
      'SELECT version FROM Entities WHERE id = $1',
      [ 'id' ])

    expect(res.rows[0]?.version).to.equal(1)
  })
})
