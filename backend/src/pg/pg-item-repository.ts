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
      'SELECT * FROM Items WHERE progress = $1',
      [ specification.progress ])
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
      'INSERT INTO Items (id, title, progress, type) VALUES ($1, $2, $3, $4)',
      [ item.id, item.title, item.progress, item.type ])
  }
}
