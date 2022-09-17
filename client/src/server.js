const http = require('http')
var express = require('express')
const fs = require('fs')

const app = express()

app.get('/', async (_, response) => {
  const data = await fs.promises.readFile('index.html')
  response.end(data)
})

app.get('/tasks', async (_, response) => {
  response.end('[]')
})

app.post('/tasks', async (request, response) => {
  const taskDTO = await readBody(request)
  response.end(taskDTO.title)
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

function readBody(request) {
  return new Promise((resolve) => {
    request.setEncoding('utf-8')
    var body = ''
    request.on('data', data => { body += data })
    request.on('end', () => resolve(JSON.parse(body)))
  })
}

