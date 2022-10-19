import { ItemRepository } from '../backend'
import { Progress, Item, TaskState, ItemType } from '../domain/item.js'
import PGDatabase from './pg-database'

export default class PGItemRepository implements ItemRepository {
  private readonly database: PGDatabase

  constructor(database: PGDatabase) {
    this.database = database
  }

  async allWithProgress(progress: Progress) {
    const res = await this.database.query(
      'SELECT * FROM Items WHERE progress = $1',
      [ Progress[progress] ])
    return res.rows.map(item)
  }

  async get(id: string): Promise<Item | undefined> {
    const res = await this.database.query(
      'SELECT * FROM Items WHERE id = $1',
      [ id ])
    return item(res.rows[0])
  }

  async add(item: Item) {
    await this.database.query(
      'INSERT INTO Items (id, title, progress, type) VALUES ($1, $2, $3, $4)',
      [ item.id, item.title, Progress[item.progress], ItemType[item.type] ])
  }

  async update(item: Item) {
    await this.database.query(
      'UPDATE Items SET title = $2, progress = $3, type = $4 WHERE id = $1',
      [ item.id, item.title, Progress[item.progress], ItemType[item.type] ])
  }
}

type TaskRow = {
  id: string
  title: string
  progress: keyof typeof Progress
  type: keyof typeof ItemType
}

function item(row: TaskRow) {
  const props: TaskState = {
    title: row.title,
    assignee: null,
    progress: Progress[row.progress],
  }
  return Item.reconstitute(row.id, ItemType[row.type], props)
}
