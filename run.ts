import { connect } from './src/pg-task-repository.js'
import backend from './src/backend.js'
import frontend from './src/frontend.js'
import { env, exit } from 'process'

const database = env['DATABASE_NAME']
if (!database) {
  console.error('The environment variable DATABASE_NAME must be set')
  exit(1)
}

backend.setRepository(await connect(database))
backend.listenAtPort(8000)
frontend.listenAtPort(80)
console.log('Ready')
