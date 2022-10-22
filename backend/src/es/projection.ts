import { Event } from './source.js'

export interface EventProjection {
  project(id: string, events: Event[]): Promise<void>;
}
