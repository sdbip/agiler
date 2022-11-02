import { expect } from '@esm-bundle/chai'
import { DOMElement } from '../src/dom-element'
import { ItemListTransition } from '../src/item-list-transition'

describe(ItemListTransition.name, () => {

  describe('tagNewItems', () => {

    it('tags new items', () => {

      const transition = new ItemListTransition(
        createElement('<div></div>'),
        [ { id: '1' } ])

      expect(transition.taggedItems[0].isNew).is.true
    })

    it('doesn\'t tag already added item', () => {

      const transition = new ItemListTransition(
        createElement('<div><div id="item-1">Item1</div></div>'),
        [ { id: '1' } ])

        expect(transition.taggedItems[0].isNew).is.false
    })
  })

  describe('findObsoleteElements', () => {

    it('returns elements that are not represented', () => {

      const transition = new ItemListTransition(
        createElement('<div><div id="item-1">Item1</div></div>'),
        [])

      expect(transition.obsoleteElements).to.have.lengthOf(1)
    })

    it('skips elements with representation', () => {
      const transition = new ItemListTransition(
        createElement('<div><div id="item-1">Item1</div></div>'),
        [ { id: '1' } ])

      expect(transition.obsoleteElements).to.have.lengthOf(0)
    })
  })
})

const createElement = (html: string): DOMElement => {
  const outerElement = document.createElement('div')
  outerElement.innerHTML = html
  return new DOMElement(outerElement.children[0] as HTMLElement)
}
