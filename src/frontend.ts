import { promises as fs } from 'fs'
import { setupServer } from './server.js'

const server = setupServer()

server.get('/', async () => {
  const data = await fs.readFile('index.html')
  return {
    statusCode: 200,
    content: data.toString('utf-8'),
  }
})

export default server.finalize()
