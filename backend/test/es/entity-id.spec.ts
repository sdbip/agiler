import { expect } from 'chai'
import { EntityId } from '../../src/es/source'

describe(EntityId.name, () => {

  it('equals if same id and type', () => {
    expect(new EntityId('id', 'type').equals(new EntityId('id', 'type'))).to.be.true
  })

  it('does not equal if id is different', () => {
    expect(new EntityId('id', 'type').equals(new EntityId('other_id', 'type'))).to.be.false
  })
  
  it('does not equal if type is different', () => {
    expect(new EntityId('id', 'type').equals(new EntityId('id', 'other_type'))).to.be.false
  })
})
