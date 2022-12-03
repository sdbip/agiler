import { assert } from '@esm-bundle/chai'
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

export class MockWriteModel implements WriteModel {
  lastAddedTitle?: string
  lastAddedType?: ItemType
  lastAddedParentId?: string
  idToReturn?: string

  lastPromotedId?: string
  lastCompletedId?: string

  async addItem(title: string, type: ItemType, parentId: string | undefined) {
    const id = this.idToReturn
    if (!id) assert.fail('idToReturn not set up')
    this.lastAddedTitle = title
    this.lastAddedType = type
    this.lastAddedParentId = parentId
    return { id }
  }

  async promoteTask(id: string) {
    this.lastPromotedId = id
  }
  async completeTask(id: string) {
    this.lastCompletedId = id
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
