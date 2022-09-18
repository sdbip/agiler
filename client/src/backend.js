const http = require('http')
const express = require('express')
const fs = require('fs').promises

const app = express()

app.get('/tasks', async (_, response) => {
  setBody(response, [])
})

app.post('/tasks', async (request, response) => {
  const taskDTO = await readBody(request)
  setBody(response, taskDTO)
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
    let body = ''
    request.on('data', data => { body += data })
    request.on('end', () => resolve(JSON.parse(body)))
  })
}

function setBody(response, object) {
  response.end(JSON.stringify(object))
}

