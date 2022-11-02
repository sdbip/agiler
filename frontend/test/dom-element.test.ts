import { expect } from '@esm-bundle/chai'
import { ClassSelector, TagSelector, toSelector } from '../src/class-name'
import { DOMElement } from '../src/dom-element'

describe(DOMElement.name, () => {

  describe('single', () => {

    it('finds element by id', () => {
      const element = document.createElement('div')
      element.id = 'this_element'
      document.body.appendChild(element)

      const html = DOMElement.single(toSelector('#this_element'))
      expect(html).to.exist
      expect(html?.id).to.equal('this_element')

      document.body.removeChild(element)
    })

    it('finds element by tag name', () => {
      const element = document.createElement('div')
      element.id = 'this_element'
      document.body.appendChild(element)

      const html = DOMElement.single(toSelector('div'))
      expect(html).to.exist
      expect(html?.id).to.equal('this_element')

      document.body.removeChild(element)
    })

    it('finds element by class name', () => {
      const element = document.createElement('div')
      element.className = 'this-element'
      element.id = 'this_element'
      document.body.appendChild(element)

      const html = DOMElement.single(toSelector('.this-element'))
      expect(html).to.exist
      expect(html?.id).to.equal('this_element')

      document.body.removeChild(element)
    })

    it('finds child element by class name', () => {
      const element = document.createElement('div')
      element.innerHTML = '<div class="this-element"></div>'

      const html = DOMElement.single(toSelector('.this-element'), new DOMElement(element))
      expect(html).to.exist
    })

    it('finds child element by tag name', () => {
      const element = document.createElement('div')
      element.innerHTML = '<div class="this-element"></div>'

      const html = DOMElement.single(toSelector('div'), new DOMElement(element))
      expect(html).to.exist
    })
  })

  describe('all', () => {

    it('finds elements by tag name', () => {
      const element = document.createElement('div')
      element.id = 'this_element'
      document.body.appendChild(element)

      const htmls = DOMElement.all(toSelector('div') as TagSelector)
      expect(htmls).to.have.lengthOf(1)
      expect(new DOMElement(element).equals(htmls[0])).to.be.true

      document.body.removeChild(element)
    })

    it('finds elements by class name', () => {
      const element = document.createElement('div')
      element.className = 'this-element'
      element.id = 'this_element'
      document.body.appendChild(element)

      const htmls = DOMElement.all(toSelector('.this-element') as ClassSelector)
      expect(htmls).to.have.lengthOf(1)
      expect(new DOMElement(element).equals(htmls[0])).to.be.true

      document.body.removeChild(element)
    })

    it('finds child elements by class name', () => {
      const element = document.createElement('div')
      element.innerHTML = '<div class="this-element"></div>'

      const htmls = DOMElement.all(toSelector('.this-element') as ClassSelector, new DOMElement(element))
      expect(htmls).to.have.lengthOf(1)
    })

    it('finds child elements by tag name', () => {
      const element = document.createElement('div')
      element.innerHTML = '<div class="this-element"></div>'

      const htmls = DOMElement.all(toSelector('.this-element') as ClassSelector, new DOMElement(element))
      expect(htmls).to.have.lengthOf(1)
    })
  })
})
