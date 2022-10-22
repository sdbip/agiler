import { expect } from 'chai'
import { Event } from '../../src/es/source'

describe(Event.name, () => {
  it('throws if details is missing', () => {
    expect(() => new Event('missing details', null)).to.throw('details must be set')
  })

  it('throws if details is not an object', () => {
    expect(() => new Event('missing details', 'not an object')).to.throw('details must be an object')
  })
})
