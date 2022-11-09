import { setupServer } from '../../shared/src/server.js'
import { render, resolve } from './page-renderer.js'

const server = setupServer({})

server.public(resolve('../public'))
server.get('/', () => render('index'))
server.get('/index', () => render('index'))
server.get('/features', () => render('features'))

const s = server.finalize()
export const listenAtPort = s.listenAtPort.bind(s)
export const stopListening = s.stopListening.bind(s)

export default {
  listenAtPort,
  stopListening,
}
