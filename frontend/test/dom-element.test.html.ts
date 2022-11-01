import { runTests } from '@web/test-runner-mocha'
import { expect } from '@esm-bundle/chai'
import { DOMElement } from '../src/dom-element'

runTests(() => {
  it('can be created from HTML', () => {
    const element = DOMElement.fromHTML('<div></div>')
    expect(DOMElement.BODY.children).to.have.lengthOf(1)
    DOMElement.BODY.add(element)
    expect(DOMElement.BODY.children).to.have.lengthOf(2)
  })
})
