import express from 'express'
import { createServer } from 'http'

export const setupServer = () => {
  const app = express()
  return {
    get: (path, handler) => {
      app.get(path, async (request, response) => {
        try {
          await handler(request, response)
        } catch (error) {
          response.statusCode = 500
          response.end(JSON.stringify({ error }))
        }
      })
    },
    post: (path, handler) => {
      app.post(path, async (request, response) => {
        try {
          await handler(request, response)
        } catch (error) {
          response.statusCode = 500
          response.end(JSON.stringify({ error }))
        }
      })
    },
    finalize: () => new Server(app),
  }
}

class Server {
  constructor(app) {
    this.app = app
  }

  listenAtPort(port) {
    if (!port) throw new Error('called without port number')
    
    this.server = createServer(this.app)
    this.server.listen(port)
  }

  stopListening() {
    return new Promise((resolve, reject) => {
      if (!this.server) return reject('no server started')
      this.server.close((error) => {
        if (error) return reject(error)
  
        resolve()
      })
    })
  }
}
