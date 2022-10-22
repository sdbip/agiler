import { Progress, Item } from './domain/item.js'
import { NOT_FOUND, Request, setupServer } from '../../shared/src/server.js'
import { ItemDTO } from './dtos/item-dto.js'
import { Event, EventPublisher, EventRepository } from './es/index.js'

export interface ItemRepository {
  itemsWithProgress(progress: Progress): Promise<ItemDTO[]>
}

export interface EventProjection {
  project(id: string, events: Event[]): Promise<void>
}

const server = setupServer({})
let itemRepository: ItemRepository
let projection: EventProjection | undefined
let eventRepository: EventRepository | undefined
let publisher: EventPublisher | undefined

server.get('/task', async () => {
  const tasks = await itemRepository.itemsWithProgress(Progress.notStarted)
  return tasks.map(t => ({ id:t.id, title: t.title, type: t.type }))
})

server.post('/task', async (request) => {
  const command = await readBody(request)
  const item = Item.new(command.title)
  await publisher?.publishChanges(item)
  await projection?.project(item.id, item.unpublishedEvents)
  return {
    id: item.id,
    title: item.title,
  }
})

server.patch('/task/:id/promote', async (request) => {
  const id = request.params.id

  const history = await eventRepository?.getHistoryFor(id)
  if (!history) return NOT_FOUND

  const item = Item.reconstitute(id, history.version, history.events)
  item.promote()
  await publisher?.publishChanges(item)
  await projection?.project(id, item.unpublishedEvents)

  return {}
})

server.patch('/task/:id/assign', async (request) => {
  const id = request.params.id
  
  const history = await eventRepository?.getHistoryFor(id)
  if (!history) return NOT_FOUND

  const dto = await readBody(request)

  const item = Item.reconstitute(id, history.version, history.events)
  item.assign(dto.member)
  await publisher?.publishChanges(item)
  await projection?.project(id, item.unpublishedEvents)

  return {}
})

server.patch('/task/:id/complete', async (request) => {
  const id = request.params.id

  const history = await eventRepository?.getHistoryFor(id)
  if (!history) return NOT_FOUND

  const item = Item.reconstitute(id, history.version, history.events)
  item.complete()
  await publisher?.publishChanges(item)
  await projection?.project(id, item.unpublishedEvents)

  return {}
})

const s = server.finalize()
export function setEventProjection(p: EventProjection) { projection = p }
export function setEventRepository(r: EventRepository) { eventRepository = r }
export function setRepository(r: ItemRepository) { itemRepository = r }
export function setPublisher(p: EventPublisher) { publisher = p }
export const listenAtPort = s.listenAtPort.bind(s)
export const stopListening = s.stopListening.bind(s)

export default {
  listenAtPort,
  stopListening,
  setEventProjection,
  setEventRepository, 
  setPublisher, 
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
