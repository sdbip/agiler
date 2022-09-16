const http = require('http')
const fs = require('fs')

let server
module.exports = {
  listenAtPort: (port) => {
    if (!port) throw new Error('called without port number')

    server = http.createServer()
    server.on('request', async (_, response) => {
      const data = await fs.promises.readFile('index.html')
      response.end(data)
    })
    server.listen(port)
  },
  stopListening: () => {
    return new Promise((resolve, reject) => {
      if (!server) return reject('no server started')
      server.close((error) => {
        if (error) return reject(error)

        resolve()
      })
    })
  },
}
