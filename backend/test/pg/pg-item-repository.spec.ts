import { assert } from 'chai'
import { promises as fs } from 'fs'
import { PGItemRepository } from '../../src/pg/pg-item-repository'
import { PGDatabase } from '../../src/pg/pg-database'
import { ItemType, Progress } from '../../src/dtos/item-dto'

describe(PGItemRepository.name, () => {
  let repository: PGItemRepository
  let database: PGDatabase

  beforeEach(async () => {
    const databaseName = process.env['TEST_DATABASE_NAME']
    if (!databaseName) assert.fail('The environment variable TEST_DATABASE_NAME must be set')

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
    assert.exists(storedRows)
    assert.include(storedRows.map(t => t.id), 'task')
  })

  it('can be set to only include completed tasks', async () => {
    await repository.add({
      id: 'completed',
      type: ItemType.Task,
      title: 'Completed Task',
      progress: Progress.completed,
    })

    const storedRows = await repository.itemsWithSpecification({ progress: Progress.notStarted })
    assert.exists(storedRows)
    assert.notInclude(storedRows.map(t => t.id), 'completed')
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
    assert.exists(storedRows)
    assert.notInclude(storedRows.map(t => t.id), 'subtask')
  })

  it('includes stories', async () => {
    await repository.add({
      id: 'story',
      type: ItemType.Story,
      title: 'Completed Story',
      progress: Progress.notStarted,
    })

    const storedRows = await repository.itemsWithSpecification({ progress: Progress.notStarted })
    assert.exists(storedRows)
    assert.include(storedRows.map(t => t.id), 'story')
  })

  it('can be specified to only return subtasks of a specific parent', async () => {
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
    assert.exists(storedRows)
    assert.include(storedRows.map(t => t.id), 'subtask')
    assert.notInclude(storedRows.map(t => t.id), 'other_task')
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
    assert.exists(storedRows)
    assert.include(storedRows.map(t => t.id), 'subtask')
    assert.notInclude(storedRows.map(t => t.id), 'other_task')
  })

  it('returns only items of a specified type', async () => {
    await repository.add({
      id: 'feature',
      type: ItemType.Feature,
      title: 'Feature',
      progress: Progress.notStarted,
    })

    await repository.add({
      id: 'task',
      type: ItemType.Task,
      title: 'Task',
      progress: Progress.notStarted,
    })

    const storedRows = await repository.itemsWithSpecification({ type: ItemType.Feature })
    assert.exists(storedRows)
    assert.include(storedRows.map(t => t.id), 'feature')
    assert.notInclude(storedRows.map(t => t.id), 'task')
  })

  it('allows specifying multiple types', async () => {
    await repository.add({
      id: 'feature',
      type: ItemType.Feature,
      title: 'Feature',
      progress: Progress.notStarted,
    })

    await repository.add({
      id: 'epic',
      type: ItemType.Epic,
      title: 'Epic',
      progress: Progress.notStarted,
    })

    await repository.add({
      id: 'task',
      type: ItemType.Task,
      title: 'Task',
      progress: Progress.notStarted,
    })

    const storedRows = await repository.itemsWithSpecification({ type: [ ItemType.Feature, ItemType.Epic ] })
    assert.exists(storedRows)
    assert.include(storedRows.map(t => t.id), 'feature')
    assert.include(storedRows.map(t => t.id), 'epic')
    assert.notInclude(storedRows.map(t => t.id), 'task')
  })

  it('allows specifying type and progress', async () => {
    await repository.add({
      id: 'completed',
      type: ItemType.Task,
      title: 'Completed task',
      progress: Progress.completed,
    })

    await repository.add({
      id: 'task',
      type: ItemType.Task,
      title: 'Stand-alone task',
      progress: Progress.notStarted,
    })

    await repository.add({
      id: 'story',
      type: ItemType.Story,
      title: 'Story',
      progress: Progress.notStarted,
    })

    const storedRows = await repository.itemsWithSpecification({ progress: Progress.notStarted, type: ItemType.Task })
    assert.exists(storedRows)
    assert.include(storedRows.map(t => t.id), 'task')
    assert.notInclude(storedRows.map(t => t.id), 'completed')
    assert.notInclude(storedRows.map(t => t.id), 'story')
  })

  it('allows specifying type and parent', async () => {
    await repository.add({
      id: 'subtask',
      type: ItemType.Task,
      title: 'Subtask',
      progress: Progress.notStarted,
      parentId: 'a_parent',
    })

    await repository.add({
      id: 'task',
      type: ItemType.Task,
      title: 'Task',
      progress: Progress.notStarted,
    })

    await repository.add({
      id: 'story',
      type: ItemType.Story,
      title: 'Story',
      progress: Progress.notStarted,
    })

    const storedRows = await repository.itemsWithSpecification({ parent: null, type: ItemType.Task })
    assert.exists(storedRows)
    assert.include(storedRows.map(t => t.id), 'task')
    assert.notInclude(storedRows.map(t => t.id), 'subtask')
    assert.notInclude(storedRows.map(t => t.id), 'story')
  })

  it('allows specifying type, parent and progress all at once', async () => {
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

    await repository.add({
      id: 'story',
      type: ItemType.Story,
      title: 'Story',
      progress: Progress.notStarted,
    })

    const storedRows = await repository.itemsWithSpecification({ parent: 'a_parent', progress: Progress.notStarted, type: ItemType.Task })
    assert.exists(storedRows)
    assert.include(storedRows.map(t => t.id), 'subtask')
    assert.notInclude(storedRows.map(t => t.id), 'other_task')
    assert.notInclude(storedRows.map(t => t.id), 'story')
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

    const storedRows = await repository.itemsWithSpecification({})
    assert.lengthOf(storedRows, 2)
  })
})
