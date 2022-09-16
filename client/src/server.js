const http = require('http')
let server
module.exports = {
  listenAtPort: (port) => {
    server = http.createServer()
    server.on('request', (request, response) => {
      response.end('foo')
    })
    server.listen(port)
  },
  stopListening: () => {
    server?.close()
  },
}
