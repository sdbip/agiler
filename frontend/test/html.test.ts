import { expect } from '@esm-bundle/chai'
import { HTML } from '../src/html'

describe(HTML.name, () => {

  describe('single', () => {

    it('finds element by id', () => {
      const element = document.createElement('div')
      element.id = 'this_element'
      document.body.appendChild(element)

      const html = HTML.single('#this_element')
      expect(html).to.exist
      expect(html?.id).to.equal('this_element')

      document.body.removeChild(element)
    })

    it('finds element by tag name', () => {
      const element = document.createElement('div')
      element.id = 'this_element'
      document.body.appendChild(element)

      const html = HTML.single('div')
      expect(html).to.exist
      expect(html?.id).to.equal('this_element')

      document.body.removeChild(element)
    })

    it('finds element by class name', () => {
      const element = document.createElement('div')
      element.className = 'this-element'
      element.id = 'this_element'
      document.body.appendChild(element)

      const html = HTML.single('.this-element')
      expect(html).to.exist
      expect(html?.id).to.equal('this_element')

      document.body.removeChild(element)
    })

    it('finds child element by class name', () => {
      const element = document.createElement('div')
      element.innerHTML = '<div class="this-element"></div>'

      const html = HTML.single('.this-element', new HTML(element))
      expect(html).to.exist
    })

    it('finds child element by tag name', () => {
      const element = document.createElement('div')
      element.innerHTML = '<div class="this-element"></div>'

      const html = HTML.single('div', new HTML(element))
      expect(html).to.exist
    })
  })

  describe('all', () => {

    it('finds elements by tag name', () => {
      const element = document.createElement('div')
      element.id = 'this_element'
      document.body.appendChild(element)

      const htmls = HTML.all('div')
      expect(htmls).to.have.lengthOf(1)
      expect(htmls[0].element).to.equal(element)

      document.body.removeChild(element)
    })

    it('finds elements by class name', () => {
      const element = document.createElement('div')
      element.className = 'this-element'
      element.id = 'this_element'
      document.body.appendChild(element)

      const htmls = HTML.all('.this-element')
      expect(htmls).to.have.lengthOf(1)
      expect(htmls[0].element).to.equal(element)

      document.body.removeChild(element)
    })

    it('finds child elements by class name', () => {
      const element = document.createElement('div')
      element.innerHTML = '<div class="this-element"></div>'

      const htmls = HTML.all('.this-element', new HTML(element))
      expect(htmls).to.have.lengthOf(1)
    })

    it('finds child elements by tag name', () => {
      const element = document.createElement('div')
      element.innerHTML = '<div class="this-element"></div>'

      const htmls = HTML.all('.this-element', new HTML(element))
      expect(htmls).to.have.lengthOf(1)
    })
  })
})
