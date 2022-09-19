import { promises as fs } from 'fs'
import { setupServer } from './server.js'

const server = setupServer()

server.get('/', async (_, response) => {
  const data = await fs.readFile('index.html')
  response.end(data)
})

export default server.finalize()
