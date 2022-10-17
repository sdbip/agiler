import { assert, expect } from 'chai'
import { promises as fs } from 'fs'
import { Progress, Item } from '../../src/domain/item'
import PGIemRepository from '../../src/pg/pg-item-repository'
import PGDatabase from '../../src/pg/pg-database'

describe('PGIemRepository', () => {
  let repository: PGIemRepository
  let database: PGDatabase
  
  before(async () => {
    const databaseName = process.env['TEST_DATABASE_NAME']
    if (!databaseName) assert.fail('The environment variable TEST_DATABASE_NAME must be set')
    
    database = await PGDatabase.connect(databaseName)
    const tasks = await fs.readFile('./schema/schema.sql')
    database.query(tasks.toString('utf-8'))
    repository = new PGIemRepository(database)  
  })

  after(async () => {
    database.close()
  })

  it('can add tasks and find them again', async () => {
    const task = Item.new('Make PGIemRepository work')
    await repository.add(task)

    const taskInRepository = await repository.get(task.id)
    expect(taskInRepository).instanceOf(Item)
    expect(taskInRepository?.id).to.equal(task.id)
    expect(taskInRepository?.progress).to.equal(task.progress)
    expect(taskInRepository?.title).to.equal(task.title)
  })

  it('can update tasks', async () => {
    const task = Item.new('Make PGIemRepository work')
    await repository.add(task)

    task.complete()
    repository.update(task)

    const taskInRepository = await repository.get(task.id)
    expect(taskInRepository?.progress).to.equal(Progress.completed)
  })

  it('finds stored tasks', async () => {
    const task = Item.new('Make PGIemRepository work')
    await repository.add(task)

    const storedTasks = await repository.allWithProgress(Progress.notStarted)
    assert.ok(storedTasks)
    expect(storedTasks[0]).instanceOf(Item)
    expect(storedTasks.map(t => t.id)).contain(task.id)
  })

  it('ignores completed tasks', async () => {
    const task = Item.new('Completed Task')
    task.complete()
    await repository.add(task)

    const storedTasks = await repository.allWithProgress(Progress.notStarted)
    assert.ok(storedTasks)
    expect(storedTasks.map(t => t.id)).not.contain(task.id)
  })
})
