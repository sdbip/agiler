const http = require('http')
const express = require('express')
const fs = require('fs').promises

const app = express()

app.get('/', async (_, response) => {
  const data = await fs.readFile('index.html')
  response.end(data)
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
