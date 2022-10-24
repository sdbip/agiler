import { NOT_FOUND, Request, setupServer } from '../../shared/src/server.js'
import { Item } from './domain/item.js'
import { Event, EventProjection } from './es/projection.js'
import { EventPublisher, EventRepository } from './es/source.js'

let projection: EventProjection | undefined
let eventRepository: EventRepository | undefined
let publisher: EventPublisher | undefined
export function setEventProjection(p: EventProjection) { projection = p }
export function setEventRepository(r: EventRepository) { eventRepository = r }
export function setPublisher(p: EventPublisher) { publisher = p }

export const server = setupServer({})
server.post('/item', async (request) => {
  const command = await readBody(request)
  const item = Item.new(command.title)
  await publishChanges(item)
  return { id: item.id }
})

server.patch('/item/:id/promote', async (request) => {
  const item = await reconstituteItem(request.params.id)
  if (!item) return NOT_FOUND
  item.promote()
  await publishChanges(item)
  return {}
})

server.patch('/item/:id/assign', async (request) => {
  const item = await reconstituteItem(request.params.id)
  if (!item) return NOT_FOUND

  const dto = await readBody(request)
  item.assign(dto.member)
  await publishChanges(item)
  return {}
})

server.patch('/item/:id/complete', async (request) => {
  const item = await reconstituteItem(request.params.id)
  if (!item) return NOT_FOUND

  item.complete()
  await publishChanges(item)
  return {}
})

const s = server.finalize()
export const listenAtPort = s.listenAtPort.bind(s)
export const stopListening = s.stopListening.bind(s)

export default {
  listenAtPort,
  stopListening,
  setEventProjection,
  setEventRepository,
  setPublisher,
}

const readBody = async (request: Request): Promise<any> => {
  return await new Promise((resolve, reject) => {
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

const reconstituteItem = async (id: string) => {
  const history = await eventRepository?.getHistoryFor(id)
  return history && Item.reconstitute(id, history.version, history.events)
}

const publishChanges = async (item: Item) => {
  await publisher?.publishChanges(item, 'system_actor')
  await projection?.project(item.unpublishedEvents.map(e => new Event(item.entityId, e.name, e.details)))
}
