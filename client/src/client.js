const express = require('express')
const fs = require('fs').promises
const { Server } = require('./server')

const app = express()

app.get('/', async (_, response) => {
  const data = await fs.readFile('index.html')
  response.end(data)
})

module.exports = new Server(app)
