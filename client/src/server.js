const http = require('http')

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
module.exports.Server = Server
