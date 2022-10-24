import { failFast } from '../../../shared/src/failFast.js'
import { CanonicalEntityId } from './source.js'

export class Event {
  constructor(readonly entity: CanonicalEntityId, readonly name: string, readonly details: any) {
    failFast.unlessObject(details, 'details')
    failFast.unlessString(name, 'name')
    failFast.unlessInstanceOf(CanonicalEntityId)(entity, 'entity')
  }
}
export interface EventProjection {
  project(events: Event[]): Promise<void>
}
