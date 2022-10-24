import { expect } from 'chai'
import { EntityVersion } from '../../src/es/source'

describe(EntityVersion.name, () => {
  it('NotSaved which is negative', () => {
    expect(EntityVersion.NotSaved.value).to.lessThan(0)
  })

  it('can be incremented', () => {
    expect(EntityVersion.of(0).next()).to.deep.equal(EntityVersion.of(1))
  })

  it('starts at zero', () => {
    expect(EntityVersion.NotSaved.next()).to.deep.equal(EntityVersion.of(0))
  })

  it('is equal if value is equal', () => {
    expect(EntityVersion.of(1).equals(EntityVersion.of(1))).is.true
  })

  it('is not equal if value differs', () => {
    expect(EntityVersion.of(0).equals(EntityVersion.of(1))).is.false
  })
})
