import { expect } from 'chai'
import { CanonicalEntityId } from '../../src/es/source'

describe(CanonicalEntityId.name, () => {

  it('equals if same id and type', () => {
    expect(new CanonicalEntityId('id', 'type').equals(new CanonicalEntityId('id', 'type'))).to.be.true
  })

  it('does not equal if id is different', () => {
    expect(new CanonicalEntityId('id', 'type').equals(new CanonicalEntityId('other_id', 'type'))).to.be.false
  })
  
  it('does not equal if type is different', () => {
    expect(new CanonicalEntityId('id', 'type').equals(new CanonicalEntityId('id', 'other_type'))).to.be.false
  })
})
