import { promises as fs } from 'fs'
import { setupServer } from '../../shared/src/server.js'
import path from 'path'
import { fileURLToPath } from 'url'
import Mustache from 'mustache'

const server = setupServer({})

server.public(resolve('../public'))
server.get('/', () => render('index'))

server.get('/features', async () => {
  return {
    statusCode: 200,
    content: '<html><body>/features works!!</body></html>',
  }
})

const s = server.finalize()
export const listenAtPort = s.listenAtPort.bind(s)
export const stopListening = s.stopListening.bind(s)

export default {
  listenAtPort,
  stopListening,
}

async function render(page: string) {
  const data = await fs.readFile(resolve('../pages/template.mustache.html'))
  return Mustache.render(data.toString('utf-8'), { page })
}

function resolve(relPath: string) {
  const thisFile = fileURLToPath(import.meta.url)
  const thisDir = path.dirname(thisFile)
  return path.join(thisDir, relPath)
}
