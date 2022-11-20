import { failFast } from '../../shared/src/failFast.js'
import { setupServer } from '../../shared/src/server.js'
import { ItemDTO } from './dtos/item-dto.js'
import { ItemType, Progress } from './dtos/enums.js'
import { NOTFOUND } from 'dns'

export type ItemSpecification = {
  progress?: Progress | Progress[]
  parent?: string | null
  type?: ItemType | ItemType[]
}

export interface ItemRepository {
  get(id: string): Promise<ItemDTO | undefined>
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
  return await itemRepository.itemsWithSpecification(specification)
})

server.get('/item/:id', async (request) => {
  return await itemRepository.get(request.params.id) ?? NOTFOUND
})

server.get('/item/:id/child', async (request) => {
  const types = (request.query.type as string)?.split('|') as ItemType[]
  if (types) failFast.unlessArrayOfEnum(ItemType)(types, 'type')

  const specification: ItemSpecification = {
    progress: Progress.notStarted,
    type: types,
    parent: request.params.id,
  }
  return await itemRepository.itemsWithSpecification(specification)
})

const s = server.finalize()
export const listenAtPort = s.listenAtPort.bind(s)
export const stopListening = s.stopListening.bind(s)

export default {
  listenAtPort,
  stopListening,
  setRepository,
}
