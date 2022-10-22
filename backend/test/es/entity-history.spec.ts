import { expect } from 'chai'
import { EntityHistory, EntityVersion } from '../../src/es/source'

describe(EntityHistory.name, () => {

  it('throws if events array is null', () => {
    expect(() => new EntityHistory(EntityVersion.NotSaved, null as any)).to.throw('events must be set')
  })

  it('throws if events is not an array', () => {
    expect(() => new EntityHistory(EntityVersion.NotSaved, 'not an array' as any)).to.throw('argument events must be an array')
  })

  it('throws if events contains non-events', () => {
    expect(() => new EntityHistory(EntityVersion.NotSaved, [ 'not an event' ] as any)).to.throw('argument events must only contain elements of type class Event')
  })

  it('throws if version is not set', () => {
    expect(() => new EntityHistory(null as any, [])).to.throw('version must be set')
  })

  it('throws if version is not an EntityVersion', () => {
    expect(() => new EntityHistory('not a version' as any, [])).to.throw('version must be an instance of class EntityVersion')
  })
})
