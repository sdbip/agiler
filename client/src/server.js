const http = require('http')
var express = require('express')
const fs = require('fs')

const app = express()

app.get('/', async (_, response) => {
  response.writeHead(200)
  const data = await fs.promises.readFile('index.html')
  response.end(data)
})

app.post('/', async (request, response) => {
  var body = ''
  request.setEncoding('utf-8')
  request.on('data', data => { body += data })
  request.on('end', () => {
    response.writeHead(200)
    response.end('Hello, World!')
  })
})

let server
module.exports.listenAtPort = (port) => {
  if (!port) throw new Error('called without port number')
  
  server = http.createServer(app)
  server.listen(port)
}

module.exports.stopListening = () => {
  return new Promise((resolve, reject) => {
    if (!server) return reject('no server started')
    server.close((error) => {
      if (error) return reject(error)

      resolve()
    })
  })
}
