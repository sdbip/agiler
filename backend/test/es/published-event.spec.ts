import { expect } from 'chai'
import { PublishedEvent } from '../../src/es/source'

describe(PublishedEvent.name, () => {
  it('throws if name is not set', () => {
    expect(() => new PublishedEvent(null as any, '{}')).to.throw('name must be set')
  })

  it('throws if name is not a string', () => {
    expect(() => new PublishedEvent(42 as any, '{}')).to.throw('name must be a string')
  })

  it('throws if details is not set', () => {
    expect(() => new PublishedEvent('name', null as any)).to.throw('details must be set')
  })

  it('throws if details is not a string', () => {
    expect(() => new PublishedEvent('name', {} as any)).to.throw('details must be a string')
  })
})
