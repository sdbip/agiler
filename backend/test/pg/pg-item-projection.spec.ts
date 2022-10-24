import { expect } from 'chai'
import { promises as fs } from 'fs'
import { Item } from '../../src/domain/item'
import { Progress, ItemType } from '../../src/dtos/item-dto'
import { PGDatabase } from '../../src/pg/pg-database'
import { Event } from '../../src/es/projection'
import { PGItemProjection } from '../../src/pg/pg-item-projection'

describe(PGItemProjection.name, () => {
  let projection: PGItemProjection
  let database: PGDatabase

  before(async () => {
    const databaseName = process.env['TEST_DATABASE_NAME']
    if (!databaseName) expect.fail('The environment variable TEST_DATABASE_NAME must be set')

    database = await PGDatabase.connect(databaseName)
    projection = new PGItemProjection(database)

    const schemaDDL = await fs.readFile('./schema/schema.sql')
    await database.query('DROP TABLE IF EXISTS Items')
    await database.query(schemaDDL.toString('utf-8'))
  })

  after(async () => {
    database.close()
  })

  it('can complete tasks', async () => {
    const item = Item.new('Make PGItemRepository work')
    item.complete()
    const events = convertUnpublishedEvents(item)

    await projection.project(events)

    const row = await getItemRow(item.id, database)
    expect(row?.progress).to.equal(Progress.completed)
  })

  it('can promote tasks', async () => {
    const item = Item.new('Make PGItemRepository work')
    item.promote()
    const events = convertUnpublishedEvents(item)

    await projection.project(events)

    const row = await getItemRow(item.id, database)
    expect(row?.type).to.equal(ItemType.Story)
  })

  it('can assign tasks', async () => {
    const item = Item.new('Make PGItemRepository work')
    item.assign('Agent 47')
    const events = convertUnpublishedEvents(item)

    await projection.project(events)

    const row = await getItemRow(item.id, database)
    expect(row?.assignee).to.equal('Agent 47')
  })
})

const convertUnpublishedEvents = (entity: Item) =>
  entity.unpublishedEvents.map(e => new Event(entity.entityId, e.name, e.details))


const getItemRow = async(id: string, database: PGDatabase) => {
  const res = await database.query('SELECT * FROM Items WHERE id = $1', [ id ])
  return res.rows[0]
}  
