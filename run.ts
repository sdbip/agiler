import backend from './backend/src/backend.js'
import frontend from './frontend/src/frontend.js'
import { env, exit } from 'process'
import { PGDatabase } from './backend/src/pg/pg-database.js'
import { PGItemRepository } from './backend/src/pg/pg-item-repository.js'
import { PGEventPublisher } from './backend/src/pg/pg-event-publisher.js'
import { PGEventRepository } from './backend/src/pg/pg-event-repository.js'
import { promises as fs } from 'fs'
import { PGRepository } from './backend/src/pg/pg-repository.js'

const databaseName = env['DATABASE_NAME']
if (!databaseName) {
  console.error('The environment variable DATABASE_NAME must be set')
  exit(1)
}
const database = await PGDatabase.connect(databaseName)
const repository = new PGRepository(database)
const itemRepository = new PGItemRepository(database)

const schemaDDL = await fs.readFile('./schema/schema.sql')
await database.query(schemaDDL.toString('utf-8'))

backend.setRepository(itemRepository)
backend.setEventProjection(itemRepository)
backend.setEventRepository(new PGEventRepository(repository))
backend.setPublisher(new PGEventPublisher(repository))
backend.listenAtPort(8000)

frontend.setBackendURL('http://localhost:8000')
frontend.listenAtPort(80)

process.on('SIGINT', async () => {
  await stop(backend)
  await stop(frontend)

  async function stop(server: { stopListening(): Promise<void> }) {
    try {
      await server.stopListening()
    } catch (err) { }
  }
})

console.log('Ready')
