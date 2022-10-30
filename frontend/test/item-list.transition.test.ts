import { expect } from '@esm-bundle/chai'
import { ItemListTransition } from '../src/item-list-transition'

describe(ItemListTransition.name, () => {

  describe('tagNewItems', () => {

    it('tags new items', () => {

      const transition = new ItemListTransition(
        [],
        [ { id: '1' } ])

      expect(transition.taggedItems[0].isNew).is.true
    })

    it('doesn\'t tag already added item', () => {

      const transition = new ItemListTransition(
        [ createElement('<div id="item-1">Item1</div>') ],
        [ { id: '1' } ])

        expect(transition.taggedItems[0].isNew).is.false
    })
  })

  describe('findObsoleteElements', () => {

    it('returns elements that are not represented', () => {

      const transition = new ItemListTransition(
        [ createElement('<div id="item-1">Item1</div>') ],
        [])

      expect(transition.obsoleteElements).to.have.lengthOf(1)
    })

    it('skips elements with representation', () => {
      const transition = new ItemListTransition(
        [ createElement('<div id="item-1">Item1</div>') ],
        [ { id: '1' } ])

      expect(transition.obsoleteElements).to.have.lengthOf(0)
    })
  })
})

const createElement = (html: string): HTMLElement => {
  const outerElement = document.createElement('div')
  outerElement.innerHTML = html
  return outerElement.children[0] as HTMLElement
}
