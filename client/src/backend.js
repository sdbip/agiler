const express = require('express')
const { Server } = require('./server')

const app = express()

app.get('/tasks', async (_, response) => {
  setBody(response, [])
})

app.post('/tasks', async (request, response) => {
  const taskDTO = await readBody(request)
  setBody(response, taskDTO)
})

module.exports = new Server(app)

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

