import { ItemRepository, ItemSpecification } from '../read-model'
import { ItemDTO } from '../dtos/item-dto.js'
import { PGDatabase } from './pg-database'

export class PGItemRepository implements ItemRepository {
  private readonly database: PGDatabase

  constructor(database: PGDatabase) {
    this.database = database
  }

  async itemsWithSpecification(specification: ItemSpecification): Promise<ItemDTO[]> {
    const res = await this.database.query(
      `SELECT * FROM Items WHERE ${whereClause(specification)}`,
      parameters(specification))
    return res.rows
  }

  async get(id: string): Promise<ItemDTO | undefined> {
    const res = await this.database.query(
      'SELECT * FROM Items WHERE id = $1',
      [ id ])
    return res.rows[0]
  }

  async add(item: ItemDTO) {
    await this.database.query(
      'INSERT INTO Items (id, title, progress, type, parent_id) VALUES ($1, $2, $3, $4, $5)',
      [ item.id, item.title, item.progress, item.type, item.parentId ])
  }
}

const whereClause = (specification: ItemSpecification) => {
  const result = []
  if (specification.progress) result.push('progress = $1')
  if (specification.parent === null) result.push('parent_id IS NULL')
  return result.join(' AND ')
}

const parameters = (specification: ItemSpecification) => {
  return [ specification.parent, specification.progress ].filter(p => p)
}
