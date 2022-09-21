import express from 'express'
import { createServer, Server as HTTPServer } from 'http'

export type Request = express.Request
export type Handler = (request: Request) => Promise<Response>
export interface Response {
  statusCode?: number
  content?: string | object
}

export const setupServer = () => {
  const app = express()

  function wrapNewHandler(handler: Handler) {
    return async (request: express.Request, response: express.Response) => {
      const result = await callHandler(request)
      outputResult(response, result)
    }

    async function callHandler(request: Request) {
      try {
        return await handler(request)
      } catch (thrown) {
        const { message } = thrown as Error
        const error = { message }
        return {
          statusCode: 500,
          content: { error },
        }
      }
    }

    function outputResult(response: express.Response, result: Response) {
      response.statusCode = result.statusCode ?? 200
      response.end(typeof result === 'string'
        ? result
        : typeof result.content === 'string'
          ? result.content
          : JSON.stringify(result.content))
    }
  }

  return {
    get: (path: string, handler: Handler) => {
      app.get(path, wrapNewHandler(handler))
    },
    post: (path: string, handler: Handler) => {
      app.post(path, wrapNewHandler(handler))
    },
    patch: (path: string, handler: Handler) => {
      app.patch(path, wrapNewHandler(handler))
    },
    finalize: () => new Server(app),
  }
}

export class Server {
  private app: express.Express
  private server?: HTTPServer

  constructor(app: express.Express) {
    this.app = app
  }

  listenAtPort(port: number) {
    if (!port) throw new Error('called without port number')
    
    this.server = createServer(this.app)
    this.server.listen(port)
  }

  stopListening() {
    return new Promise((resolve, reject) => {
      if (!this.server) return reject('no server started')
      this.server.close((error) => {
        if (error) return reject(error)
  
        resolve(undefined)
      })
    })
  }
}
