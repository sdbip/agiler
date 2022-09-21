import { Progress, Task } from './domain/task.js'
import { NOT_FOUND, Request, setupServer } from './server.js'

export interface TaskRepository {
  allWithProgress(progress: Progress): Promise<Task[]>
  get(id: string): Promise<Task | undefined>
  add(task: Task): Promise<void>
}

const server = setupServer()
let repository: TaskRepository

server.get('/task', async () => {
  const tasks = await repository.allWithProgress(Progress.notStarted)
  return {
     content: tasks.map(t => ({ id:t.id, title: t.title })),
   }
})

server.post('/task', async (request) => {
  const taskDTO = await readBody(request)
  const task = Task.new(taskDTO.title)
  repository.add(task)
  return {
      content: {
      id: task.id,
      title: task.title,
    },
  }
})

server.patch('/task/:id/assign', async (request) => {
  const task = await repository.get(request.params.id)
  if (!task) return NOT_FOUND

  const dto = await readBody(request)
  task.assign(dto.member)
  return {}
})

server.patch('/task/:id/complete', async (request) => {
  const task = await repository.get(request.params.id)
  if (!task) return NOT_FOUND

  task.complete()
  return {}
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
