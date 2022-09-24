import backend from './src/backend.js'
import frontend from './src/frontend.js'
import { env, exit } from 'process'
import PGDatabase from './src/pg/pg-database.js'
import PGTaskRepository from './src/pg/pg-task-repository.js'

const databaseName = env['DATABASE_NAME']
if (!databaseName) {
  console.error('The environment variable DATABASE_NAME must be set')
  exit(1)
}
const database = await PGDatabase.connect(databaseName)

backend.setRepository(new PGTaskRepository(database))
backend.listenAtPort(8000)
frontend.listenAtPort(80)

process.on('SIGINT', async () => {
  await backend.stopListening()
  await frontend.stopListening()
})

console.log('Ready')
