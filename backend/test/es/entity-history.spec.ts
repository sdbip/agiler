import { expect } from 'chai'
import { EntityHistory } from '../../src/es'

describe(EntityHistory.name, () => {

  it('throws if events array is null', () => {
    expect(() => new EntityHistory(null as any)).to.throw()
  })

  it('throws if events is not an array', () => {
    expect(() => new EntityHistory('not an array' as any)).to.throw()
  })

  it('throws if events contains non-events', () => {
    expect(() => new EntityHistory([ 'not an event' ] as any)).to.throw()
  })
})
