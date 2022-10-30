import { expect } from '@esm-bundle/chai'
import { HTML } from '../src/html'

describe('HTML class', () => {
  let element: HTML

  beforeEach(() => {
    const domElement = document.createElement('div')
    element = new HTML(domElement)
  })

  describe('hasClass', () => {

    it('returns false for no class', () => {
      element.element.className = ''
      expect(element.hasClass('expected')).to.be.false
    })

    it('returns false if has other class', () => {
      element.element.className = 'not-expected'
      expect(element.hasClass('expected')).to.be.false
    })

    it('returns true if has expected', () => {
      element.element.className = 'expected'
      expect(element.hasClass('expected')).to.be.true
    })

    it('returns true if has expected after decoy', () => {
      element.element.className = 'not-expected expected'
      expect(element.hasClass('expected')).to.be.true
    })

    it('returns true if has expected among other', () => {
      element.element.className = 'expected other'
      expect(element.hasClass('expected')).to.be.true
    })

  })

  describe('addClass', () => {

    it('sets class on the element', () => {
      element.element.className = ''
      element.addClass('class')
      expect(element.hasClass('class')).to.be.true
    })

    it('keeps other class names', () => {
      element.element.className = 'other'
      element.addClass('class')
      expect(element.hasClass('class')).to.be.true
      expect(element.hasClass('other')).to.be.true
    })

    it('does not repeat class', () => {
      element.element.className = 'class'
      element.addClass('class')
      expect(element.element.className).to.equal('class')
    })

  })

  describe('removeClass', () => {

    it('removes class from the element', () => {
      element.element.className = 'class'
      element.removeClass('class')
      expect(element.hasClass('class')).to.be.false
    })

    it('does not remove other class names', () => {
      element.element.className = 'other class'
      element.removeClass('class')
      expect(element.hasClass('other')).to.be.true
      expect(element.hasClass('class')).to.be.false
    })

    it('does not remove decoy class names', () => {
      element.element.className = 'not-class class'
      element.removeClass('class')
      expect(element.hasClass('not-class')).to.be.true
      expect(element.hasClass('class')).to.be.false
    })

    it('removes repeated occurrences', () => {
      element.element.className = 'class class'
      element.removeClass('class')
      expect(element.hasClass('class')).to.be.false
    })

  })
})
