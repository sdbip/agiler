import { expect } from 'chai'
import { EntityVersion } from '../../src/es'

describe(EntityVersion.name, () => {
  it('NotSaved which is negative', () => {
    expect(EntityVersion.NotSaved.value).to.lessThan(0)
  })

  it('is equal if value is equal', () => {
    expect(EntityVersion.of(1).equals(EntityVersion.of(1)))
      .to.equal(true, '1 should equal 1')
  })

  it('is not equal if value differs', () => {
    expect(EntityVersion.of(0).equals(EntityVersion.of(1)))
      .to.equal(false, '0 should not equal 1')
  })

  it('throws if set to negative', () => {
    expect(() => EntityVersion.of(-1)).to.throw('version must not be negative')
  })

  it('throws if not set', () => {
    expect(() => EntityVersion.of(null as any)).to.throw('version must be set')
  })

  it('throws if not a number', () => {
    expect(() => EntityVersion.of('kalle' as any)).to.throw('version must be a number')
  })
})
