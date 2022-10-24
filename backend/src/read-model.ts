import { setupServer } from '../../shared/src/server.js'
import { ItemDTO, Progress } from './dtos/item-dto.js'

export interface ItemRepository {
  itemsWithProgress(progress: Progress): Promise<ItemDTO[]>
}

let itemRepository: ItemRepository
export function setRepository(r: ItemRepository) { itemRepository = r }

export const server = setupServer({})
server.get('/item', async () => {
  const items = await itemRepository.itemsWithProgress(Progress.notStarted)
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
