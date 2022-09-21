import { Task } from './domain/task.js'
import { Request, setupServer } from './server.js'

export interface TaskRepository {
  getNew(): Promise<Task[]>
  get(id: string): Promise<Task | undefined>
  add(task: Task): Promise<void>
}

const server = setupServer()
let repository: TaskRepository

server.get('/task', async () => {
  const tasks = await repository.getNew()
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
  if (!task) return {
    statusCode: 404,
    content: '',
  }

  task.start()
  return {
    content: '',
  }
})

server.patch('/task/:id/complete', async (request) => {
  const task = await repository.get(request.params.id)
  if (!task) return {
    statusCode: 404,
    content: '',
  }

  task.complete()
  return {
    content: '',
  }
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
