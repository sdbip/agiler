import backend from './src/backend.js'
import frontend from './src/frontend.js'
import InMem from './src/inmem.js'

backend.setRepository(new InMem())
backend.listenAtPort(8000)
frontend.listenAtPort(80)
console.log('Ready')
