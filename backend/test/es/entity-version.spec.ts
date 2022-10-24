import { expect } from 'chai'
import { EntityVersion } from '../../src/es/source'

describe(EntityVersion.name, () => {

  it('equals other version with same value', () => {
    expect(EntityVersion.of(1).equals(EntityVersion.of(1))).is.true
  })

  it('does not equal version with different value', () => {
    expect(EntityVersion.of(0).equals(EntityVersion.of(1))).is.false
  })

  it('has a `new` state which is not a positive number', () => {
    expect(EntityVersion.new.value).is.not.greaterThanOrEqual(0)
  })

  it('can be incremented', () => {
    expect(EntityVersion.of(0).next()).to.deep.equal(EntityVersion.of(1))
  })

  it('starts at zero', () => {
    expect(EntityVersion.new.next()).to.deep.equal(EntityVersion.of(0))
  })
})
