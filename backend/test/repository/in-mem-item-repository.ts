import { ItemRepository } from '../../src/backend'
import { Progress, ItemType, TaskState } from '../../src/domain/item'
import { ItemDTO } from '../../src/dtos/item-dto'

export class InMemItemRepository implements ItemRepository {
  items: {[id: string]: [ItemType, TaskState]} = {}

  async itemsWithProgress(progress: Progress): Promise<ItemDTO[]> {
    return Object.entries(this.items)
      .filter(([ , [ , state ] ]) => state.progress === progress)
      .map(([ id, [ type, state ] ]) => ({ id, type, ...state }))
  }
  async add(item: ItemDTO) { this.items[item.id] = [ item.type, { ...item } ]}
  async update(item: ItemDTO) { this.items[item.id] = [ item.type, { ...item } ]}
}
