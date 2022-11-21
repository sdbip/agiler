import { ItemDTO } from '../browser-src/backend/dtos'
import { ReadModel, WriteModel } from '../browser-src/item-cache'

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

function resolved<T>(value: T) {
  return new Promise<T>(resolve => resolve(value))
}
