import { Request, Response } from 'express'
import { setupServer } from './server.js'

export interface TaskRepository {
  getAll(): Promise<any>
  add(task: any): Promise<void>
}

const server = setupServer()
let repository: TaskRepository

server.get('/tasks', async (_, response) => {
  setBody(response, await repository.getAll())
})

server.post('/tasks', async (request, response) => {
  const taskDTO = await readBody(request)
  repository.add(taskDTO)
  setBody(response, taskDTO)
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

function readBody(request: Request) {
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

