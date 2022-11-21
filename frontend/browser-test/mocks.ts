import { ItemDTO, ItemType } from '../browser-src/backend/dtos'
import { ReadModel, WriteModel } from '../browser-src/item-cache'

export class MockReadModel implements ReadModel {

  lastRequestedParentId?: string
  lastRequestedTypes?: ItemType[]
  itemsToReturn: ItemDTO[] = []

  lastRequestedId?: string
  itemToReturn?: ItemDTO

  async fetchItem(id: string): Promise<ItemDTO | undefined> {
    this.lastRequestedId = id
    return this.itemToReturn
  }

  async fetchItems(parentId: string | undefined, types: ItemType[]): Promise<ItemDTO[]> {
    this.lastRequestedParentId = parentId
    this.lastRequestedTypes = types
    return this.itemsToReturn
  }
}

const EMPTY_ITEM_DTO = {} as ItemDTO

export function stubReadModel(): ReadModel {
  return {
    fetchItem: () => resolved(EMPTY_ITEM_DTO),
    fetchItems: () => resolved([]),
  }
}

export function stubWriteModel(): WriteModel {
  return {
    addItem: () => resolved(EMPTY_ITEM_DTO),
    completeTask: () => resolvedVoid(),
    promoteTask: () => resolvedVoid(),
  }
}

function resolvedVoid() {
  return new Promise<void>(resolve => resolve())
}

export function resolved<T>(value: T) {
  return new Promise<T>(resolve => resolve(value))
}
