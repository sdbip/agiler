import { failFast } from './failFast'
import { EntityId } from './source'

export class Event {
  constructor(readonly entity: EntityId, readonly name: string, readonly details: any) {
    failFast.unlessObject(details, 'details')
    failFast.unlessString(name, 'name')
    failFast.unlessInstanceOf(EntityId)(entity, 'entity')
  }
}
export interface EventProjection {
  project(events: Event[]): Promise<void>
}
