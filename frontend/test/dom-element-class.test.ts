import { expect } from '@esm-bundle/chai'
import { ClassName } from '../src/class-name'
import { DOMElement } from '../src/dom-element'

describe(DOMElement.name, () => {

  describe('class-name manipulation', () => {

    let element: DOMElement
    let htmlElement: HTMLElement

    beforeEach(() => {
      htmlElement = document.createElement('div')
      element = new DOMElement(htmlElement)
    })

    describe('hasClass', () => {

      const expected = ClassName.default

      it('returns false for no class', () => {
        htmlElement.className = ''
        expect(element.hasClass(ClassName.default)).to.be.false
      })

      it('returns false if has other class', () => {
        htmlElement.className = `not-${expected.name}`
        expect(element.hasClass(expected)).to.be.false
      })

      it('returns true if has expected', () => {
        htmlElement.className = expected.name
        expect(element.hasClass(expected)).to.be.true
      })

      it('returns true if has expected after decoy', () => {
        htmlElement.className = `not-${expected.name} ${expected.name}`
        expect(element.hasClass(expected)).to.be.true
      })

      it('returns true if has expected among other', () => {
        htmlElement.className = `${expected.name} other`
        expect(element.hasClass(expected)).to.be.true
      })

    })

    describe('addClass', () => {

      const added = ClassName.default
      const other = ClassName.inactive

      it('sets class on the element', () => {
        htmlElement.className = ''
        element.addClass(added)
        expect(element.hasClass(added)).to.be.true
      })

      it('keeps other class names', () => {
        htmlElement.className = other.name
        element.addClass(added)
        expect(element.hasClass(added)).to.be.true
        expect(element.hasClass(other)).to.be.true
      })

      it('does not repeat class', () => {
        htmlElement.className = added.name
        element.addClass(added)
        expect(htmlElement.className).to.equal(added.name)
      })

    })

    describe('removeClass', () => {

      const removed = ClassName.default
      const other = ClassName.inactive

      it('removes class from the element', () => {
        htmlElement.className = removed.name
        element.removeClass(removed)
        expect(element.hasClass(removed)).to.be.false
      })

      it('does not remove other class names', () => {
        htmlElement.className = `${other.name} ${removed.name}`
        element.removeClass(removed)
        expect(element.hasClass(other)).to.be.true
        expect(element.hasClass(removed)).to.be.false
      })

      it('does not remove decoy class names', () => {
        htmlElement.className = `not-${removed.name} ${removed.name}`
        element.removeClass(removed)
        expect(element.hasClass(removed)).to.be.false
        expect(htmlElement.className).to.equal(`not-${removed.name}`)
      })

      it('removes repeated occurrences', () => {
        htmlElement.className = `${removed.name} ${removed.name}`
        element.removeClass(removed)
        expect(element.hasClass(removed)).to.be.false
      })

    })
  })
})
