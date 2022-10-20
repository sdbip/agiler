import { Progress, Item } from './domain/item.js'
import { NOT_FOUND, Request, setupServer } from '../../shared/src/server.js'
import { ItemDTO } from './dtos/item-dto.js'
import { EventPublisher, EventRepository } from './es'

export interface ItemRepository {
  itemsWithProgress(progress: Progress): Promise<ItemDTO[]>
  add(item: ItemDTO): Promise<void>
  update(item: ItemDTO): Promise<void>
}

const server = setupServer({})
let itemRepository: ItemRepository
let eventRepository: EventRepository | undefined
let publisher: EventPublisher | undefined

server.get('/task', async () => {
  const tasks = await itemRepository.itemsWithProgress(Progress.notStarted)
  return tasks.map(t => ({ id:t.id, title: t.title, type: t.type }))
})

server.post('/task', async (request) => {
  const command = await readBody(request)
  const item = Item.new(command.title)
  await itemRepository.add({ id: item.id, type: item.type, title: item.title, progress: item.progress, assignee: item.assignee })
  await publisher?.publish(item.id, 'Item', item.unpublishedEvents)
  return {
    id: item.id,
    title: item.title,
  }
})

server.patch('/task/:id/promote', async (request) => {
  const id = request.params.id

  const events = await eventRepository?.getEvents(id)
  if (!events) return NOT_FOUND

  const item = Item.reconstitute(id, events)
  item.promote()
  await publisher?.publish(id, 'Item', item.unpublishedEvents)

  const syncedItem: ItemDTO = {
    id: item.id,
    type: item.type,
    title: item.title,
    progress: item.progress,
    assignee: item.assignee,
  }
  await itemRepository.update(syncedItem)

  return {}
})

server.patch('/task/:id/assign', async (request) => {
  const id = request.params.id
  
  const events = await eventRepository?.getEvents(id)
  if (!events) return NOT_FOUND

  const dto = await readBody(request)

  const item = Item.reconstitute(id, events)
  item.assign(dto.member)
  await publisher?.publish(id, 'Item', item.unpublishedEvents)

  const syncedItem: ItemDTO = {
    id: item.id,
    type: item.type,
    title: item.title,
    progress: item.progress,
    assignee: item.assignee,
  }
  await itemRepository.update(syncedItem)

  return {}
})

server.patch('/task/:id/complete', async (request) => {
  const id = request.params.id

  const events = await eventRepository?.getEvents(id)
  if (!events) return NOT_FOUND

  const item = Item.reconstitute(id, events)
  item.complete()
  await publisher?.publish(id, 'Item', item.unpublishedEvents)

  const syncedItem: ItemDTO = {
    id: item.id,
    type: item.type,
    title: item.title,
    progress: item.progress,
    assignee: item.assignee,
  }
  await itemRepository.update(syncedItem)

  return {}
})

const s = server.finalize()
export function setEventRepository(r: EventRepository) { eventRepository = r }
export function setRepository(r: ItemRepository) {itemRepository = r}
export function setPublisher(p: EventPublisher) {publisher = p}
export const listenAtPort = s.listenAtPort.bind(s)
export const stopListening = s.stopListening.bind(s)

export default {
  listenAtPort,
  stopListening,
  setEventRepository, 
  setRepository,
}

function readBody(request: Request): Promise<any> {
  return new Promise((resolve, reject) => {
    request.setEncoding('utf-8')
    let body = ''
    request.on('data', data => { body += data })
    request.on('end', () => {
      try {
        resolve(JSON.parse(body))
      } catch (error: any) {
        reject({ error: error.toString() })
      }
    })
  })
}
