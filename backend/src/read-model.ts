import { setupServer } from '../../shared/src/server.js'
import { ItemDTO, Progress } from './dtos/item-dto.js'

export type ItemSpecification = {
  progress?: Progress
  parent?: string | null
}

export interface ItemRepository {
  itemsWithSpecification(specification: ItemSpecification): Promise<ItemDTO[]>
}

let itemRepository: ItemRepository
export function setRepository(r: ItemRepository) { itemRepository = r }

export const server = setupServer({})
server.get('/item', async () => {
  const items = await itemRepository.itemsWithSpecification({ progress: Progress.notStarted, parent: null })
  return items.map(t => ({ id: t.id, title: t.title, type: t.type }))
})

server.get('/item/:id/task', async (request) => {
  const items = await itemRepository.itemsWithSpecification({ progress: Progress.notStarted, parent: request.params.id })
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
