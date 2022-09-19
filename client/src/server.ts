import express, { Request, Response } from 'express'
import { createServer, Server as HTTPServer } from 'http'

export type Handler = (request: Request, response: Response) => Promise<void>

export const setupServer = () => {
  const app = express()

  function wrapHandler(handler: Handler) {
    return async function handleRequest(request: Request, response: Response) {
      try {
        await handler(request, response)
      } catch (error) {
        response.statusCode = 500
        response.end(JSON.stringify({ error }))
      }
    }
  }

  return {
    get: (path: string, handler: Handler) => {
      app.get(path, wrapHandler(handler))
    },
    post: (path: string, handler: Handler) => {
      app.post(path, wrapHandler(handler))
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
