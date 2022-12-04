import readModel from './backend/src/read-model.js'
import writeModel from './backend/src/write-model.js'
import frontend from './frontend/src/frontend.js'
import { env } from 'process'
import { PGDatabase } from './backend/src/pg/pg-database.js'
import { PGItemRepository } from './backend/src/pg/pg-item-repository.js'
import { PGItemProjection } from './backend/src/pg/pg-item-projection.js'
import { PGEventPublisher } from './backend/src/pg/pg-event-publisher.js'
import { PGEventRepository } from './backend/src/pg/pg-event-repository.js'
import { promises as fs } from 'fs'
import { PGRepository } from './backend/src/pg/pg-repository.js'

const database = undefined as any as PGDatabase
const repository = new PGRepository(database)

const schemaDDL = await fs.readFile('./schema/schema.sql')
await database?.query(schemaDDL.toString('utf-8'))

readModel.setRepository(new PGItemRepository(database))
readModel.listenAtPort(Number(env['READ_MODEL_PORT'] ?? 9999))

writeModel.setEventProjection(new PGItemProjection(database))
writeModel.setEventRepository(new PGEventRepository(repository))
writeModel.setPublisher(new PGEventPublisher(repository))
writeModel.listenAtPort(Number(env['WRITE_MODEL_PORT'] ?? 8888))

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
