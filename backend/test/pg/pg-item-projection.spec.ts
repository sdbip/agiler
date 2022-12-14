import { assert } from 'chai'
import { promises as fs } from 'fs'
import { Item } from '../../src/domain/item'
import { ItemType, Progress } from '../../src/dtos/enums'
import { PGDatabase } from '../../src/pg/pg-database'
import { PGItemProjection } from '../../src/pg/pg-item-projection'
import { ImmediateSyncSystem } from '../../src/immediate-sync-system'

describe(PGItemProjection.name, () => {
  let projection: PGItemProjection
  let database: PGDatabase
  let immediate: ImmediateSyncSystem

  before(async () => {
    const databaseName = process.env['TEST_DATABASE_NAME']
    if (!databaseName) assert.fail('The environment variable TEST_DATABASE_NAME must be set')

    database = await PGDatabase.connect(databaseName)
    projection = new PGItemProjection(database)
    immediate = new ImmediateSyncSystem(projection)

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

    await immediate.sync(item)

    const row = await getItemRow(item.id, database)
    assert.equal(row?.progress, Progress.completed)
  })

  it('can promote tasks', async () => {
    const item = Item.new('Make PGItemRepository work')
    item.promote()

    await immediate.sync(item)

    const row = await getItemRow(item.id, database)
    assert.equal(row?.type, ItemType.Story)
  })

  it('can assign tasks', async () => {
    const item = Item.new('Make PGItemRepository work')
    item.assign('Agent 47')

    await immediate.sync(item)

    const row = await getItemRow(item.id, database)
    assert.equal(row?.assignee, 'Agent 47')
  })

  it('can update task parent', async () => {
    const story = Item.new('This is the parent')
    const task = Item.new('This is the child')
    story.promote()
    story.add(task)

    await immediate.sync(task)

    const row = await getItemRow(task.id, database)
    assert.equal(row?.parent_id, story.id)
  })
})

const getItemRow = async (id: string, database: PGDatabase) => {
  const res = await database.query('SELECT * FROM Items WHERE id = $1', [ id ])
  return res.rows[0]
}
