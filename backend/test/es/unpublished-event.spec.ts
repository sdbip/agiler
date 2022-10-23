import { expect } from 'chai'
import { UnpublishedEvent } from '../../src/es/source'

describe(UnpublishedEvent.name, () => {
  it('throws if name is not set', () => {
    expect(() => new UnpublishedEvent(null as any, '{}')).to.throw('name must be set')
  })

  it('throws if name is not a string', () => {
    expect(() => new UnpublishedEvent(42 as any, '{}')).to.throw('name must be a string')
  })

  it('throws if details is not set', () => {
    expect(() => new UnpublishedEvent('name', null as any)).to.throw('details must be set')
  })

  it('throws if details is not an object', () => {
    expect(() => new UnpublishedEvent('name', '{}' as any)).to.throw('details must be an object')
  })
})
