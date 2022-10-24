import { expect } from 'chai'
import { promises as fs } from 'fs'
import { PGItemRepository } from '../../src/pg/pg-item-repository'
import { PGDatabase } from '../../src/pg/pg-database'
import { ItemType, Progress } from '../../src/dtos/item-dto'

describe(PGItemRepository.name, () => {
  let repository: PGItemRepository
  let database: PGDatabase

  before(async () => {
    const databaseName = process.env['TEST_DATABASE_NAME']
    if (!databaseName) expect.fail('The environment variable TEST_DATABASE_NAME must be set')

    database = await PGDatabase.connect(databaseName)
    repository = new PGItemRepository(database)

    const schemaDDL = await fs.readFile('./schema/schema.sql')
    await database.query('DROP TABLE IF EXISTS Items')
    await database.query(schemaDDL.toString('utf-8'))
  })

  after(async () => {
    database.close()
  })

  it('finds stored tasks', async () => {
    await repository.add({
      id: 'task',
      type: ItemType.Task,
      title: 'Task',
      progress: Progress.notStarted,
    })

    const storedRows = await repository.itemsWithProgress(Progress.notStarted)
    expect(storedRows).to.exist
    expect(storedRows.map(t => t.id)).contain('task')
  })

  it('ignores completed tasks', async () => {
    await repository.add({
      id: 'completed',
      type: ItemType.Task,
      title: 'Completed Task',
      progress: Progress.completed,
    })

    const storedRows = await repository.itemsWithProgress(Progress.notStarted)
    expect(storedRows).to.exist
    expect(storedRows.map(t => t.id)).not.contain('completed')
  })

  it('includes stories', async () => {
    await repository.add({
      id: 'story',
      type: ItemType.Story,
      title: 'Completed Story',
      progress: Progress.notStarted,
    })

    const storedRows = await repository.itemsWithProgress(Progress.notStarted)
    expect(storedRows).to.exist
    expect(storedRows.map(t => t.id)).to.contain('story')
  })
})
