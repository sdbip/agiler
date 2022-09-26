import backend from './backend/src/backend.js'
import frontend from './frontend/src/frontend.js'
import { env, exit } from 'process'
import PGDatabase from './backend/src/pg/pg-database.js'
import PGTaskRepository from './backend/src/pg/pg-task-repository.js'

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
  await stop(backend)
  await stop(frontend)

  async function stop(server: { stopListening(): Promise<void> }) {
    try {
      await server.stopListening()
    } catch (err) { console.error(err) }
  }
})

console.log('Ready')
