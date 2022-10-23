import { expect } from 'chai'
import { promises as fs } from 'fs'
import { Progress, Item, ItemType } from '../../src/domain/item'
import { PGItemRepository } from '../../src/pg/pg-item-repository'
import { PGDatabase } from '../../src/pg/pg-database'
import { ItemDTO } from '../../src/dtos/item-dto'

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

  it('can add tasks and find them again', async () => {
    const item = Item.new('Make PGItemRepository work')
    await repository.project(item.id, item.unpublishedEvents)

    const itemInRepository = await repository.get(item.id)
    expect(itemInRepository?.id).to.equal(item.id)
    expect(itemInRepository?.progress).to.equal(item.progress)
    expect(itemInRepository?.title).to.equal(item.title)
  })

  it('can complete tasks', async () => {
    const item = Item.new('Make PGItemRepository work')
    item.complete()
    await repository.project(item.id, item.unpublishedEvents)

    const itemInRepository = await repository.get(item.id)
    expect(itemInRepository?.progress).to.equal(Progress.completed)
  })

  it('can promote tasks', async () => {
    const item = Item.new('Make PGItemRepository work')
    item.promote()
    await repository.project(item.id, item.unpublishedEvents)

    const itemInRepository = await repository.get(item.id)
    expect(itemInRepository?.type).to.equal(ItemType.Story)
  })

  it('can assign tasks', async () => {
    const item = Item.new('Make PGItemRepository work')
    item.assign('Agent 47')
    await repository.project(item.id, item.unpublishedEvents)

    const itemInRepository = await repository.get(item.id)
    expect(itemInRepository?.assignee).to.equal('Agent 47')
  })

  it('finds stored tasks', async () => {
    const item = Item.new('Make PGItemRepository work')
    await repository.add(toDTO(item))

    const storedItems = await repository.itemsWithProgress(Progress.notStarted)
    expect(storedItems).to.exist
    expect(storedItems.map(t => t.id)).contain(item.id)
  })

  it('ignores completed tasks', async () => {
    const item = Item.new('Completed Task')
    item.complete()
    await repository.add(toDTO(item))

    const storedItems = await repository.itemsWithProgress(Progress.notStarted)
    expect(storedItems).to.exist
    expect(storedItems.map(t => t.id)).not.contain(item.id)
  })

  it('includes stories', async () => {
    const item = Item.new('Story')
    item.promote()
    await repository.add(toDTO(item))

    const storedItems = await repository.itemsWithProgress(Progress.notStarted)
    expect(storedItems).to.exist
    expect(storedItems.map(t => t.id)).to.contain(item.id)
  })
})

function toDTO(item: Item): ItemDTO {
  return {
    id: item.id,
    type: item.itemType,
    title: item.title,
    progress: item.progress,
    assignee: item.assignee,
  }
}

