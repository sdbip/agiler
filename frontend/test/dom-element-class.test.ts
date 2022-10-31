import { expect } from '@esm-bundle/chai'
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

      it('returns false for no class', () => {
        htmlElement.className = ''
        expect(element.hasClass('expected')).to.be.false
      })

      it('returns false if has other class', () => {
        htmlElement.className = 'not-expected'
        expect(element.hasClass('expected')).to.be.false
      })

      it('returns true if has expected', () => {
        htmlElement.className = 'expected'
        expect(element.hasClass('expected')).to.be.true
      })

      it('returns true if has expected after decoy', () => {
        htmlElement.className = 'not-expected expected'
        expect(element.hasClass('expected')).to.be.true
      })

      it('returns true if has expected among other', () => {
        htmlElement.className = 'expected other'
        expect(element.hasClass('expected')).to.be.true
      })

    })

    describe('addClass', () => {

      it('sets class on the element', () => {
        htmlElement.className = ''
        element.addClass('class')
        expect(element.hasClass('class')).to.be.true
      })

      it('keeps other class names', () => {
        htmlElement.className = 'other'
        element.addClass('class')
        expect(element.hasClass('class')).to.be.true
        expect(element.hasClass('other')).to.be.true
      })

      it('does not repeat class', () => {
        htmlElement.className = 'class'
        element.addClass('class')
        expect(htmlElement.className).to.equal('class')
      })

    })

    describe('removeClass', () => {

      it('removes class from the element', () => {
        htmlElement.className = 'class'
        element.removeClass('class')
        expect(element.hasClass('class')).to.be.false
      })

      it('does not remove other class names', () => {
        htmlElement.className = 'other class'
        element.removeClass('class')
        expect(element.hasClass('other')).to.be.true
        expect(element.hasClass('class')).to.be.false
      })

      it('does not remove decoy class names', () => {
        htmlElement.className = 'not-class class'
        element.removeClass('class')
        expect(element.hasClass('not-class')).to.be.true
        expect(element.hasClass('class')).to.be.false
      })

      it('removes repeated occurrences', () => {
        htmlElement.className = 'class class'
        element.removeClass('class')
        expect(element.hasClass('class')).to.be.false
      })

    })
  })
})
