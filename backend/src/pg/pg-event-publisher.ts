import { Entity, EntityVersion, EventPublisher } from '../es/source.js'
import { PGRepository } from './pg-repository'

export class PGEventPublisher implements EventPublisher {

  constructor(private readonly repository: PGRepository) {}

  async publishChanges(entity: Entity, actor: string) {
    await this.repository.database.transaction(async () => {
      const expectedVersion = await this.repository.getVersionOf(entity.id)
      if (expectedVersion === undefined)
        await this.repository.insertEntity(entity.entityId, EntityVersion.of(0))
      else if (!expectedVersion.equals(entity.version))
        throw new Error('Concurrent Update Detected')

      const position = (await this.repository.getCurrentPosition() ?? -1) + 1
      let version = expectedVersion ?? EntityVersion.of(0)
      for (const event of entity.unpublishedEvents) {
        await this.repository.insertEvent(event, entity.entityId, { version, position, actor })
        version = version.next()
      }

      await this.repository.setEntityVersion(entity.id, version)
      return true
    })
  }
}
