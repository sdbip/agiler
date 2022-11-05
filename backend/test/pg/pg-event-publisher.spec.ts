import { assert } from 'chai'
import { promises as fs } from 'fs'
import { PGEventPublisher } from '../../src/pg/pg-event-publisher'
import { PGDatabase } from '../../src/pg/pg-database'
import { Entity, CanonicalEntityId, EntityVersion, UnpublishedEvent } from '../../src/es/source'
import { PGRepository } from '../../src/pg/pg-repository'

describe(PGEventPublisher.name, () => {
  let publisher: PGEventPublisher
  let database: PGDatabase
  let repository: PGRepository

  beforeEach(async () => {
    const databaseName = process.env['TEST_DATABASE_NAME']
    if (!databaseName) assert.fail('The environment variable TEST_DATABASE_NAME must be set')

    database = await PGDatabase.connect(databaseName)
    repository = new PGRepository(database)
    publisher = new PGEventPublisher(repository)

    const schemaDDL = await fs.readFile('./schema/schema.sql')
    await database.query('DROP TABLE IF EXISTS Events;DROP TABLE IF EXISTS Entities')
    await database.query(schemaDDL.toString('utf-8'))
  })

  afterEach(async () => {
    database.close()
  })

  it('can publish events for new entities', async () => {
    const entity = new TestEntity(
      new CanonicalEntityId('id', 'Item'),
      EntityVersion.new,
      [ new UnpublishedEvent('TestEvent', { value: 1 }) ])
    await publisher.publishChanges(entity, '')

    const res = await database.query(
      'SELECT * FROM Events WHERE entity_id = $1',
      [ 'id' ])
    assert.exists(res.rows[0])
    assert.deepInclude(res.rows[0], { entity_id: 'id', name: 'TestEvent', details: '{"value":1}' })
  })

  it('can publish events for existing entities', async () => {
    await repository.insertEntity(new CanonicalEntityId('id', 'type'), EntityVersion.of(0))

    const entity = new TestEntity(
      new CanonicalEntityId('id', 'Item'),
      EntityVersion.of(0),
      [ new UnpublishedEvent('TestEvent', { value: 1 }) ])
    await publisher.publishChanges(entity, '')

    const res = await database.query(
      'SELECT * FROM Events WHERE entity_id = $1',
      [ 'id' ])
    assert.exists(res.rows[0])
    assert.deepInclude(res.rows[0], { entity_id: 'id', name: 'TestEvent', details: '{"value":1}' })
  })

  it('sets increasing version number for each event', async () => {
    const entity = new TestEntity(
      new CanonicalEntityId('id', 'Item'),
      EntityVersion.new,
      [
        new UnpublishedEvent('Event1', { value: 1 }),
        new UnpublishedEvent('Event2', { value: 1 }),
      ])
    await publisher.publishChanges(entity, '')

    const res = await database.query(
      'SELECT version FROM Events WHERE entity_id = $1 ORDER BY version',
      [ 'id' ])

    assert.equal(res.rows[0]?.version, 0)
    assert.equal(res.rows[1]?.version, 1)
  })

  it('sets the first event\'s version to the current version of the entity', async () => {
    await repository.insertEntity(new CanonicalEntityId('id', 'type'), EntityVersion.of(1))

    const entity = new TestEntity(
      new CanonicalEntityId('id', 'Item'),
      EntityVersion.of(1),
      [ new UnpublishedEvent('Event1', { value: 1 }) ])
    await publisher.publishChanges(entity, '')

    const res = await database.query(
      'SELECT version FROM Events WHERE entity_id = $1',
      [ 'id' ])

    assert.isAbove(res.rowCount, 0)
    for (const row of res.rows)
      assert.equal(row.version, 1)
  })

  it('updates the version of the entity', async () => {
    const entity = new TestEntity(
      new CanonicalEntityId('id', 'Item'),
      EntityVersion.new,
      [ new UnpublishedEvent('Event1', { value: 1 }) ])
    await publisher.publishChanges(entity, '')

    assert.deepEqual(await repository.getVersionOf('id'), EntityVersion.of(1))
  })

  it('throws if the stored version has changed', async () => {
    await repository.insertEntity(new CanonicalEntityId('id', 'type'), EntityVersion.of(1))

    const entity = new TestEntity(
      new CanonicalEntityId('id', 'Item'),
      EntityVersion.of(0),
      [ new UnpublishedEvent('Event1', { value: 1 }) ])

    let didThrow = false
    try {
      await publisher.publishChanges(entity, '')
    } catch (error) {
      didThrow = true
    }

    if (!didThrow) assert.fail('this should fail')
  })

  it('sets position to 0 for first published events', async () => {
    const entity = new TestEntity(
      new CanonicalEntityId('id', 'Item'),
      EntityVersion.new,
      [
        new UnpublishedEvent('TestEvent', { value: 1 }),
        new UnpublishedEvent('TestEvent', { value: 1 }),
        new UnpublishedEvent('TestEvent', { value: 1 }),
      ])
    await publisher.publishChanges(entity, '')

    const res = await database.query(
      'SELECT position FROM Events WHERE entity_id = $1',
      [ 'id' ])
    assert.equal(res.rowCount, 3)
    for (const row of res.rows)
      assert.equal(row.position, 0)
  })

  it('sets position to the next value for existing entities', async () => {
    await repository.insertEntity(new CanonicalEntityId('other_id', 'type'), EntityVersion.of(1))
    const priorPosition = 0
    await repository.insertEvent(
      new UnpublishedEvent('prior_event', {}),
      new CanonicalEntityId('other_id', 'type'),
      {
        actor: '',
        position: priorPosition,
        version: EntityVersion.of(0),
      })

    const entity = new TestEntity(
      new CanonicalEntityId('id', 'Item'),
      EntityVersion.new,
      [
        new UnpublishedEvent('TestEvent', { value: 1 }),
        new UnpublishedEvent('TestEvent', { value: 1 }),
        new UnpublishedEvent('TestEvent', { value: 1 }),
      ])
    await publisher.publishChanges(entity, '')

    const res = await database.query(
      'SELECT position FROM Events WHERE entity_id = $1',
      [ 'id' ])
    assert.equal(res.rowCount, 3)
    for (const row of res.rows)
      assert.equal(row.position, 1)
  })

  it('sets actor', async () => {
    const entity = new TestEntity(
      new CanonicalEntityId('id', 'Item'),
      EntityVersion.new,
      [
        new UnpublishedEvent('TestEvent', { value: 1 }),
        new UnpublishedEvent('TestEvent', { value: 1 }),
        new UnpublishedEvent('TestEvent', { value: 1 }),
      ])
    await publisher.publishChanges(entity, 'actor')

    const res = await database.query(
      'SELECT actor FROM Events WHERE entity_id = $1',
      [ 'id' ])
    assert.equal(res.rowCount, 3)
    for (const row of res.rows)
      assert.equal(row.actor, 'actor')
  })
})

class TestEntity extends Entity {
  constructor(entityId: CanonicalEntityId, version: EntityVersion, events: UnpublishedEvent[]) {
    super(entityId, version)
    for (const event of events)
      this.addEvent(event)
  }
}
