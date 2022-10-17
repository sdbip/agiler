import { Progress, Item } from './domain/item.js'
import { NOT_FOUND, Request, setupServer } from '../../shared/src/server.js'

export interface ItemRepository {
  allWithProgress(progress: Progress): Promise<Item[]>
  get(id: string): Promise<Item | undefined>
  add(task: Item): Promise<void>
  update(task: Item): Promise<void>
}

const server = setupServer({})
let repository: ItemRepository

server.get('/task', async () => {
  const tasks = await repository.allWithProgress(Progress.notStarted)
  return tasks.map(t => ({ id:t.id, title: t.title }))
})

server.post('/task', async (request) => {
  const taskDTO = await readBody(request)
  const task = Item.new(taskDTO.title)
  repository.add(task)
  return {
    id: task.id,
    title: task.title,
  }
})

server.patch('/task/:id/assign', async (request) => {
  const task = await repository.get(request.params.id)
  if (!task) return NOT_FOUND

  const dto = await readBody(request)
  task.assign(dto.member)
  await repository.update(task)
  return {}
})

server.patch('/task/:id/complete', async (request) => {
  const task = await repository.get(request.params.id)
  if (!task) return NOT_FOUND

  task.complete()
  await repository.update(task)
  return {}
})

const s = server.finalize()
export function setRepository(r: ItemRepository) {repository = r}
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
