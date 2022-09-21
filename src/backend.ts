import { Request, Response } from 'express'
import { Task } from './domain/task.js'
import { setupServer } from './server.js'

export interface TaskRepository {
  getNew(): Promise<Task[]>
  get(id: string): Promise<Task | undefined>
  add(task: Task): Promise<void>
}

const server = setupServer()
let repository: TaskRepository

server.get('/task', async (request, response) => {
  const tasks = await repository.getNew()
  setBody(response, tasks.map(t => ({ id:t.id, title: t.title })))
})

server.post('/task', async (request, response) => {
  const taskDTO = await readBody(request)
  const task = Task.new(taskDTO.title)
  repository.add(task)
  setBody(response, {
    id: task.id,
    title: task.title,
  })
})

server.patch('/task/:id/assign', async (request, response) => {
  const task = await repository.get(request.params.id)
  if (!task) {
    response.statusCode = 404
    response.end()
    return
  }

  task.start()
  response.end()
})

server.patch('/task/:id/complete', async (request, response) => {
  const task = await repository.get(request.params.id)
  if (!task) {
    response.statusCode = 404
    response.end()
    return
  }

  task.complete()
  response.end()
})

const s = server.finalize()
export function setRepository(r: TaskRepository) {repository = r}
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

function setBody(response: Response, object: any) {
  response.end(JSON.stringify(object))
}

