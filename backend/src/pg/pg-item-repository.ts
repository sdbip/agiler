import { ItemRepository, ItemSpecification } from '../read-model'
import { ItemDTO } from '../dtos/item-dto.js'
import { PGDatabase } from './pg-database'

export class PGItemRepository implements ItemRepository {
  private readonly database: PGDatabase

  constructor(database: PGDatabase) {
    this.database = database
  }

  async itemsWithSpecification(specification: ItemSpecification): Promise<ItemDTO[]> {
    const clause = whereClause(specification)
    const query = clause ? `SELECT * FROM Items WHERE ${clause}` : 'SELECT * FROM Items'
    const res = await this.database.query(
      query,
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
  const parameters = [ '' ] // Create a 1-based array by placing nonsense in position 0
  if (specification.progress) parameters.push('progress')
  if (specification.parent) parameters.push('parent')
  if (specification.type)  parameters.push('type')

  const result = []
  if (specification.progress) result.push(`progress = $${parameters.indexOf('progress')}`)
  if (specification.parent === null) result.push('parent_id IS NULL')
  if (specification.parent) result.push(`parent_id = $${parameters.indexOf('parent')}`)
  if (specification.type) result.push(`type = ANY($${parameters.indexOf('type')}::TEXT[])`)
  return result.join(' AND ')
}

const parameters = (specification: ItemSpecification) => {
  const typeIn = typeof specification.type === 'string'
    ? [ specification.type ] : specification.type
  return [ specification.progress, specification.parent, typeIn ].filter(p => p)
}
