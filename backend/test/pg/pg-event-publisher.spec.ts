import { expect } from 'chai'
import { promises as fs } from 'fs'
import { PGEventPublisher } from '../../src/pg/pg-event-publisher'
import { PGDatabase } from '../../src/pg/pg-database'
import { Entity, EntityId, Event } from '../../src/es'

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
    const entity = new TestEntity(
      new EntityId('id', 'Item'),
      [ new Event('TestEvent', { value: 1 }) ])
    await publisher.publishChanges(entity)

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

    const entity = new TestEntity(
      new EntityId('id', 'Item'),
      [ new Event('TestEvent', { value: 1 }) ])
    await publisher.publishChanges(entity)

    const res = await database.query(
      'SELECT * FROM Events WHERE entity_id = $1',
      [ 'id' ])
    expect(res.rows[0]).to.exist
    expect(res.rows[0]).to.deep.include({ entity_id: 'id', name: 'TestEvent', details: '{"value":1}' })
  })

  it('sets increasing version number for each event', async () => {
    const entity = new TestEntity(
      new EntityId('id', 'Item'),
      [
        new Event('Event1', { value: 1 }),
        new Event('Event2', { value: 1 }),
      ])
    await publisher.publishChanges(entity)

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

    const entity = new TestEntity(
      new EntityId('id', 'Item'),
      [ new Event('Event1', { value: 1 }) ])
    await publisher.publishChanges(entity)

    const res = await database.query(
      'SELECT * FROM Events WHERE entity_id = $1',
      [ 'id' ])

    expect(res.rows[0]).to.deep.include({ name: 'Event1', version: 1 })
  })

  it('updates the version of the entity', async () => {
    const entity = new TestEntity(
      new EntityId('id', 'Item'),
      [ new Event('Event1', { value: 1 }) ])
    await publisher.publishChanges(entity)

    const res = await database.query(
      'SELECT version FROM Entities WHERE id = $1',
      [ 'id' ])

    expect(res.rows[0]?.version).to.equal(1)
  })
})

class TestEntity extends Entity {
  constructor(entityId: EntityId, events: Event[]) {
    super(entityId)
    for (const event of events)
      this.addEvent(event)
  }
}
