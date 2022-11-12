import { failFast } from '../../shared/src/failFast.js'
import { setupServer } from '../../shared/src/server.js'
import { ItemDTO, ItemType, Progress } from './dtos/item-dto.js'

export type ItemSpecification = {
  progress?: Progress | Progress[]
  parent?: string | null
  type?: ItemType | ItemType[]
}

export interface ItemRepository {
  itemsWithSpecification(specification: ItemSpecification): Promise<ItemDTO[]>
}

let itemRepository: ItemRepository
export function setRepository(r: ItemRepository) { itemRepository = r }

export const server = setupServer({})
server.get('/item', async (request) => {
  const types = (request.query.type as string)?.split('|') as ItemType[]
  if (types) failFast.unlessArrayOfEnum(ItemType)(types, 'type')

  const specification: ItemSpecification = {
    progress: Progress.notStarted,
    type: types,
    parent: null,
  }
  const items = await itemRepository.itemsWithSpecification(specification)
  return items.map(t => ({ id: t.id, title: t.title, type: t.type }))
})

server.get('/item/:id/child', async (request) => {
  const types = (request.query.type as string)?.split('|') as ItemType[]
  if (types) failFast.unlessArrayOfEnum(ItemType)(types, 'type')

  const specification: ItemSpecification = {
    progress: Progress.notStarted,
    type: types,
    parent: request.params.id,
  }
  const items = await itemRepository.itemsWithSpecification(specification)
  return items.map(t => ({ id: t.id, title: t.title, type: t.type }))
})

const s = server.finalize()
export const listenAtPort = s.listenAtPort.bind(s)
export const stopListening = s.stopListening.bind(s)

export default {
  listenAtPort,
  stopListening,
  setRepository,
}
