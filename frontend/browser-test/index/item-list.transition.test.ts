import { assert } from '@esm-bundle/chai'
import { DOMElement } from '../../browser-src/dom-element'
import { ItemListTransition } from '../../browser-src/index/item-list-transition'

describe(ItemListTransition.name, () => {

  describe('tagNewItems', () => {

    it('tags new items', () => {

      const transition = new ItemListTransition(
        createElement('<div></div>'),
        [ { id: '1' } ])

      assert.isTrue(transition.taggedItems[0].isNew)
    })

    it('doesn\'t tag already added item', () => {

      const transition = new ItemListTransition(
        createElement('<div><div id="item-1">Item1</div></div>'),
        [ { id: '1' } ])

        assert.isFalse(transition.taggedItems[0].isNew)
    })
  })

  describe('findObsoleteElements', () => {

    it('returns elements that are not represented', () => {

      const transition = new ItemListTransition(
        createElement('<div><div id="item-1">Item1</div></div>'),
        [])

      assert.lengthOf(transition.obsoleteElements, 1)
    })

    it('skips elements with representation', () => {
      const transition = new ItemListTransition(
        createElement('<div><div id="item-1">Item1</div></div>'),
        [ { id: '1' } ])

      assert.lengthOf(transition.obsoleteElements, 0)
    })
  })
})

const createElement = (html: string): DOMElement => {
  const outerElement = document.createElement('div')
  outerElement.innerHTML = html
  return new DOMElement(outerElement.children[0] as HTMLElement)
}
