import { promises as fs } from 'fs'
import { setupServer } from '../../shared/src/server.js'
import path from 'path'
import { fileURLToPath } from 'url'

let backendURL: string
const server = setupServer({})

server.public(resolve('../public'))
server.get('/', async () => {
  const data = await fs.readFile(resolve('../index.html'))
  return {
    statusCode: 200,
    content: data
      .toString('utf-8')
      .replace(
        '<script rel="env">',
        `<script rel="env" type="text/javascript">window.BACKEND_URL = '${backendURL}'`),
  }
})

const s = server.finalize()
export function setBackendURL(url: string) {backendURL = url}
export const listenAtPort = s.listenAtPort.bind(s)
export const stopListening = s.stopListening.bind(s)

export default {
  listenAtPort,
  stopListening,
  setBackendURL,
}

function resolve(relPath: string) {
  const thisFile = fileURLToPath(import.meta.url)
  const thisDir = path.dirname(thisFile)
  return path.join(thisDir, relPath)
}
