import { expect } from 'chai'
import { Event } from '../../src/es/projection'
import { EntityId } from '../../src/es/source'

describe(Event.name, () => {
  it('throws if entity is not set', () => {
    expect(() => new Event(null as any, 'name', {})).to.throw('entity must be set')
  })

  it('throws if entity is not an EntityId', () => {
    expect(() => new Event('not an EntityId' as any, 'name', {})).to.throw('entity must be an instance of class EntityI')
  })

  it('throws if name is not set', () => {
    expect(() => new Event(new EntityId('id', 'type'), null as any, {})).to.throw('name must be set')
  })

  it('throws if name is not a string', () => {
    expect(() => new Event(new EntityId('id', 'type'), 42 as any, {})).to.throw('name must be a string')
  })

  it('throws if details is not set', () => {
    expect(() => new Event(new EntityId('id', 'type'), 'name', null as any)).to.throw('details must be set')
  })

  it('throws if details is not an object', () => {
    expect(() => new Event(new EntityId('id', 'type'), 'name', 'not an object' as any)).to.throw('details must be an object')
  })
})
