import { failFast } from '../../../shared/src/failFast.js'
import { CanonicalEntityId } from './source.js'

export class Event {

  get details() {
    return JSON.parse(this.detailsJSON)
  }

  constructor(readonly entity: CanonicalEntityId, readonly name: string, readonly detailsJSON: string) {
    failFast.unlessString(detailsJSON, 'detailsJSON')
    failFast.unlessString(name, 'name')
    failFast.unlessInstanceOf(CanonicalEntityId)(entity, 'entity')
  }
}
export interface EventProjection {
  project(events: Event[]): Promise<void>
}
