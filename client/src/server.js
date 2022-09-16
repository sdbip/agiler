const http = require('http')
const fs = require('fs')

let server
module.exports = {
  listenAtPort: (port) => {
    if (!port) throw new Error('called without port number')

    server = http.createServer()
    server.on('request', (request, response) => {
      fs.readFile('index.html', (err, data) => {
        response.end(data)
      })
    })
    server.listen(port)
  },
  stopListening: (callback) => {
    server?.close(callback)
  },
}
