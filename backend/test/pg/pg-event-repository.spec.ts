import { assert } from 'chai'
import { promises as fs } from 'fs'
import { PGEventRepository } from '../../src/pg/pg-event-repository'
import { PGDatabase } from '../../src/pg/pg-database'
import { PGRepository } from '../../src/pg/pg-repository'
import { CanonicalEntityId, EntityVersion, PublishedEvent, UnpublishedEvent } from '../../src/es/source'

describe(PGEventRepository.name, () => {
  let eventRepository: PGEventRepository
  let repository: PGRepository
  let database: PGDatabase

  beforeEach(async () => {
    const databaseName = process.env['TEST_DATABASE_NAME']
    if (!databaseName) assert.fail('The environment variable TEST_DATABASE_NAME must be set')

    database = await PGDatabase.connect(databaseName)
    repository = new PGRepository(database)
    eventRepository = new PGEventRepository(repository)

    const schemaDDL = await fs.readFile('./schema/schema.sql')
    await database.query('DROP TABLE IF EXISTS Events;DROP TABLE IF EXISTS Entities')
    await database.query(schemaDDL.toString('utf-8'))
  })

  afterEach(async () => {
    database.close()
  })

  it('finds stored events', async () => {
    await repository.insertEntity(new CanonicalEntityId('id', 'type'), EntityVersion.of(0))
    await repository.insertEvent(
      new UnpublishedEvent('event', { test: 'value' }),
      new CanonicalEntityId('id', 'type'),
      {
        actor: 'actor',
        position: 0,
        version: EntityVersion.of(0),
      })

    const history = await eventRepository.getHistoryFor('id')
    assert.deepEqual(history?.events[0], new PublishedEvent('event', '{"test":"value"}'))
  })

  it('returns undefined if the entity does not exist', async () => {
    assert.notExists(await eventRepository.getHistoryFor('id'))
  })
})
