import { Progress, Item } from './domain/item.js'
import { NOT_FOUND, Request, setupServer } from '../../shared/src/server.js'
import { Event } from './domain/event.js'

export interface ItemRepository {
  itemsWithProgress(progress: Progress): Promise<Item[]>
  get(id: string): Promise<Item | undefined>
  add(item: Item): Promise<void>
  update(item: Item): Promise<void>
}

export interface EventPublisher {
  publish(id: string, events: Event[]): Promise<void>
}

const server = setupServer({})
let repository: ItemRepository
let publisher: EventPublisher | undefined

server.get('/task', async () => {
  const tasks = await repository.itemsWithProgress(Progress.notStarted)
  return tasks.map(t => ({ id:t.id, title: t.title, type: t.type }))
})

server.post('/task', async (request) => {
  const taskDTO = await readBody(request)
  const item = Item.new(taskDTO.title)
  await repository.add(item)
  await publisher?.publish(item.id, item.unpublishedEvents)
  return {
    id: item.id,
    title: item.title,
  }
})

server.patch('/task/:id/promote', async (request) => {
  const item = await repository.get(request.params.id)
  if (!item) return NOT_FOUND

  item.promote()
  await repository.update(item)
  await publisher?.publish(item.id, item.unpublishedEvents)
  return {}
})

server.patch('/task/:id/assign', async (request) => {
  const item = await repository.get(request.params.id)
  if (!item) return NOT_FOUND

  const dto = await readBody(request)
  item.assign(dto.member)
  await repository.update(item)
  await publisher?.publish(item.id, item.unpublishedEvents)
  return {}
})

server.patch('/task/:id/complete', async (request) => {
  const item = await repository.get(request.params.id)
  if (!item) return NOT_FOUND

  item.complete()
  await repository.update(item)
  await publisher?.publish(item.id, item.unpublishedEvents)
  return {}
})

const s = server.finalize()
export function setRepository(r: ItemRepository) {repository = r}
export function setPublisher(p: EventPublisher) {publisher = p}
export const listenAtPort = s.listenAtPort.bind(s)
export const stopListening = s.stopListening.bind(s)

export default {
  listenAtPort,
  stopListening,
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
