import { connect } from './src/pg-task-repository.js'
import backend from './src/backend.js'
import frontend from './src/frontend.js'

backend.setRepository(await connect('es_test'))
backend.listenAtPort(8000)
frontend.listenAtPort(80)
console.log('Ready')
