import { expect } from '@esm-bundle/chai'
import { addClass, hasClass, removeClass } from '../src/class'

describe('element class', () => {
  let element: Element

  beforeEach(() => {
    element = document.createElement('div')
  })

  describe('hasClass', () => {

    it('returns false for no class', () => {
      element.className = ''
      expect(hasClass(element, 'expected')).to.be.false
    })

    it('returns false if has other class', () => {
      element.className = 'not-expected'
      expect(hasClass(element, 'expected')).to.be.false
    })

    it('returns true if has expected', () => {
      element.className = 'expected'
      expect(hasClass(element, 'expected')).to.be.true
    })

    it('returns true if has expected after decoy', () => {
      element.className = 'not-expected expected'
      expect(hasClass(element, 'expected')).to.be.true
    })

    it('returns true if has expected among other', () => {
      element.className = 'expected other'
      expect(hasClass(element, 'expected')).to.be.true
    })

  })

  describe('addClass', () => {

    it('sets class on the element', () => {
      element.className = ''
      addClass(element, 'class')
      expect(hasClass(element, 'class')).to.be.true
    })

    it('keeps other class names', () => {
      element.className = 'other'
      addClass(element, 'class')
      expect(hasClass(element, 'class')).to.be.true
      expect(hasClass(element, 'other')).to.be.true
    })

    it('does not repeat class', () => {
      element.className = 'class'
      addClass(element, 'class')
      expect(element.className).to.equal('class')
    })

  })

  describe('removeClass', () => {

    it('removes class from the element', () => {
      element.className = 'class'
      removeClass(element, 'class')
      expect(hasClass(element, 'class')).to.be.false
    })

    it('does not remove other class names', () => {
      element.className = 'other class'
      removeClass(element, 'class')
      expect(hasClass(element, 'other')).to.be.true
      expect(hasClass(element, 'class')).to.be.false
    })

    it('does not remove decoy class names', () => {
      element.className = 'not-class class'
      removeClass(element, 'class')
      expect(hasClass(element, 'not-class')).to.be.true
      expect(hasClass(element, 'class')).to.be.false
    })

    it('removes repeated occurrences', () => {
      element.className = 'class class'
      removeClass(element, 'class')
      expect(hasClass(element, 'class')).to.be.false
    })

  })
})
