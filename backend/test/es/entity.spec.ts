import { expect } from 'chai'
import { UnpublishedEvent } from '../../src/es/source'

describe(UnpublishedEvent.name, () => {
  it('throws if details is missing', () => {
    expect(() => new UnpublishedEvent('missing details', null)).to.throw('details must be set')
  })

  it('throws if details is not an object', () => {
    expect(() => new UnpublishedEvent('missing details', 'not an object')).to.throw('details must be an object')
  })
})
