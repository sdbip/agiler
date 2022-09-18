const express = require('express')
const http = require('http')

module.exports.setupServer = () => {
  const app = express()
  return {
    get: app.get.bind(app),
    post: app.post.bind(app),
    finalize: () => new Server(app),
  }
}

class Server {
  constructor(app) {
    this.app = app
  }

  listenAtPort(port) {
    if (!port) throw new Error('called without port number')
    
    this.server = http.createServer(this.app)
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
