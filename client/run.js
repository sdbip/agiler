import backend from './src/backend.js'
import client from './src/client.js'
import InMem from './src/inmem.js'

backend.setRepository(new InMem())
backend.listenAtPort(8000)
client.listenAtPort(80)
console.log('Ready')
