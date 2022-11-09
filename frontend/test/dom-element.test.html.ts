import { runTests } from '@web/test-runner-mocha'
import { assert } from '@esm-bundle/chai'
import { DOMElement } from '../browser-src/dom-element'

runTests(() => {
  it('can be created from HTML', () => {
    const element = DOMElement.fromHTML('<div></div>')
    assert.lengthOf(DOMElement.BODY.children, 1)
    DOMElement.BODY.add(element)
    assert.lengthOf(DOMElement.BODY.children, 2)
  })
})
