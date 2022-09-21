import express from 'express'
import { createServer, Server as HTTPServer } from 'http'

export type Handler = (request: express.Request) => Promise<Response>
export interface Response {
  statusCode?: number
  content?: string | object
}

export const setupServer = () => {
  const app = express()

  function wrapNewHandler(handler: Handler) {
    return async (request: express.Request, response: express.Response) => {
      let result: Response
      try {
        result = await handler(request)
      } catch (error) {
        result = {
          statusCode: 500,
          content: { error },
        }
      }
    
      response.statusCode = result.statusCode ?? 200
      response.end(typeof result.content === 'string'
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
