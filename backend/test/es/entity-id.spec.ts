import { expect } from 'chai'
import { EntityId } from '../../src/es'

describe(EntityId.name, () => {
  it('throws if id is missing', () => {
    expect(() => new EntityId(null as any, 'type')).to.throw('id must be set')
  })

  it('throws if id is not a string', () => {
    expect(() => new EntityId(42 as any, 'type')).to.throw('id must be a string')
  })

  it('throws if type is missing', () => {
    expect(() => new EntityId('id', null as any)).to.throw('type must be set')
  })

  it('throws if type is missing', () => {
    expect(() => new EntityId('id', 42 as any)).to.throw('type must be a string')
  })
})
