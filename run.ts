import readModel from './backend/src/read-model.js'
import writeModel from './backend/src/write-model.js'
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

readModel.setRepository(itemRepository)
readModel.listenAtPort(8000)

writeModel.setEventProjection(itemRepository)
writeModel.setEventRepository(new PGEventRepository(repository))
writeModel.setPublisher(new PGEventPublisher(repository))
writeModel.listenAtPort(9000)

frontend.setReadModelURL('http://localhost:8000')
frontend.setWriteModelURL('http://localhost:9000')
frontend.listenAtPort(80)

process.on('SIGINT', async () => {
  await Promise.all([
    database.close(),
    readModel.stopListening(),
    writeModel.stopListening(),
    frontend.stopListening(),
  ])
})

console.log('Ready')
