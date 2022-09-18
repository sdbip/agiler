const fs = require('fs').promises
const { setupServer } = require('./server')

const server = setupServer()

server.get('/', async (_, response) => {
  const data = await fs.readFile('index.html')
  response.end(data)
})

module.exports = server.finalize()
