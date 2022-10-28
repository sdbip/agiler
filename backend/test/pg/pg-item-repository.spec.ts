import { expect } from 'chai'
import { promises as fs } from 'fs'
import { PGItemRepository } from '../../src/pg/pg-item-repository'
import { PGDatabase } from '../../src/pg/pg-database'
import { ItemType, Progress } from '../../src/dtos/item-dto'

describe(PGItemRepository.name, () => {
  let repository: PGItemRepository
  let database: PGDatabase

  beforeEach(async () => {
    const databaseName = process.env['TEST_DATABASE_NAME']
    if (!databaseName) expect.fail('The environment variable TEST_DATABASE_NAME must be set')

    database = await PGDatabase.connect(databaseName)
    repository = new PGItemRepository(database)

    const schemaDDL = await fs.readFile('./schema/schema.sql')
    await database.query('DROP TABLE IF EXISTS Items')
    await database.query(schemaDDL.toString('utf-8'))
  })

  afterEach(async () => {
    database.close()
  })

  it('finds stored tasks', async () => {
    await repository.add({
      id: 'task',
      type: ItemType.Task,
      title: 'Task',
      progress: Progress.notStarted,
    })

    const storedRows = await repository.itemsWithSpecification({ progress: Progress.notStarted })
    expect(storedRows).to.exist
    expect(storedRows.map(t => t.id)).contain('task')
  })

  it('can be set to only include completed tasks', async () => {
    await repository.add({
      id: 'completed',
      type: ItemType.Task,
      title: 'Completed Task',
      progress: Progress.completed,
    })

    const storedRows = await repository.itemsWithSpecification({ progress: Progress.notStarted })
    expect(storedRows).to.exist
    expect(storedRows.map(t => t.id)).not.contain('completed')
  })

  it('excludes subtasks if specified', async () => {
    await repository.add({
      id: 'subtask',
      type: ItemType.Task,
      title: 'Subtask',
      progress: Progress.notStarted,
      parentId: 'a_parent',
    })

    const storedRows = await repository.itemsWithSpecification({ parent: null })
    expect(storedRows).to.exist
    expect(storedRows.map(t => t.id)).not.contain('subtask')
  })

  it('includes stories', async () => {
    await repository.add({
      id: 'story',
      type: ItemType.Story,
      title: 'Completed Story',
      progress: Progress.notStarted,
    })

    const storedRows = await repository.itemsWithSpecification({ progress: Progress.notStarted })
    expect(storedRows).to.exist
    expect(storedRows.map(t => t.id)).to.contain('story')
  })

  it('can be specified to only returns subtasks of a specific parent', async () => {
    await repository.add({
      id: 'subtask',
      type: ItemType.Task,
      title: 'Subtask',
      progress: Progress.notStarted,
      parentId: 'a_parent',
    })

    await repository.add({
      id: 'other_task',
      type: ItemType.Task,
      title: 'Stand-alone task',
      progress: Progress.notStarted,
    })

    const storedRows = await repository.itemsWithSpecification({ parent: 'a_parent' })
    expect(storedRows).to.exist
    expect(storedRows.map(t => t.id)).to.contain('subtask')
    expect(storedRows.map(t => t.id)).to.not.contain('other_task')
  })

  it('allows specifying both parent and progress', async () => {
    await repository.add({
      id: 'subtask',
      type: ItemType.Task,
      title: 'Subtask',
      progress: Progress.notStarted,
      parentId: 'a_parent',
    })

    await repository.add({
      id: 'other_task',
      type: ItemType.Task,
      title: 'Stand-alone task',
      progress: Progress.notStarted,
    })

    const storedRows = await repository.itemsWithSpecification({ parent: 'a_parent', progress: Progress.notStarted })
    expect(storedRows).to.exist
    expect(storedRows.map(t => t.id)).to.contain('subtask')
    expect(storedRows.map(t => t.id)).to.not.contain('other_task')
  })

  it('returns everything if not provided a specification', async () => {
    await repository.add({
      id: 'subtask',
      type: ItemType.Task,
      title: 'Subtask',
      progress: Progress.notStarted,
      parentId: 'a_parent',
    })

    await repository.add({
      id: 'other_task',
      type: ItemType.Task,
      title: 'Stand-alone task',
      progress: Progress.notStarted,
    })

    const storedRows = await repository.itemsWithSpecification({ })
    expect(storedRows).to.have.lengthOf(2)
  })
})
