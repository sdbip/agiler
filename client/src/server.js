const http = require('http')
let server
module.exports = {
  listenAtPort: (port) => {
    if (!port) throw new Error('called without port number')

    server = http.createServer()
    server.on('request', (request, response) => {
      response.end('foo')
    })
    server.listen(port)
  },
  stopListening: (callback) => {
    server?.close(callback)
  },
}
