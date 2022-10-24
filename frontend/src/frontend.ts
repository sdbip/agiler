import { promises as fs } from 'fs'
import { setupServer } from '../../shared/src/server.js'
import path from 'path'
import { fileURLToPath } from 'url'

let readModelURL: string
let writeModelURL: string
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
        `<script rel="env" type="text/javascript">
        window.READ_MODEL_URL = '${readModelURL}'
        window.WRITE_MODEL_URL = '${writeModelURL}'
        `),
  }
})

const s = server.finalize()
export function setReadModelURL(url: string) {readModelURL = url}
export function setWriteModelURL(url: string) {writeModelURL = url}
export const listenAtPort = s.listenAtPort.bind(s)
export const stopListening = s.stopListening.bind(s)

export default {
  listenAtPort,
  stopListening,
  setReadModelURL,
  setWriteModelURL,
}

function resolve(relPath: string) {
  const thisFile = fileURLToPath(import.meta.url)
  const thisDir = path.dirname(thisFile)
  return path.join(thisDir, relPath)
}
