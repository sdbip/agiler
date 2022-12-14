import { runTests } from '@web/test-runner-mocha'
import { assert } from '@esm-bundle/chai'
import { PageComponent } from '../browser-src/page-component'
import { render, setBaseURL } from '../browser-src/templates'
import { ClassName } from '../browser-src/class-name'
import { ItemComponent } from '../browser-src/item-component'
import { DOMElement } from '../browser-src/dom-element'

runTests(() => {
  let titleInputElement: HTMLInputElement
  let itemListElement: HTMLDivElement
  let addButtonElement: DOMElement

  before(async () => {
    setBaseURL('..')
    await renderPageComponent()

    titleInputElement = getElementById('item-title')
    assert.exists(titleInputElement, 'titleInputElement')

    itemListElement = getElementById('item-list')
    assert.exists(itemListElement, 'itemListElement')

    addButtonElement = DOMElement.single({ id: 'add-button' }) as DOMElement
    assert.exists(addButtonElement, 'addButtonElement')
  })

  it('gets its title from the title element', () => {
    titleInputElement.value = 'This is a title'
    assert.equal(PageComponent.instance.title, 'This is a title')
  })

  describe('add-button styling', () => {

    describe('when not highlighted', () => {

      beforeEach(() => {
        addButtonElement.removeClass(ClassName.default)
      })

      it('highlights add-button when receiving focus event', () => {
        titleInputElement.value = 'not empty'
        PageComponent.instance.handleUIEvent('focus', undefined)
        assert.isTrue(addButtonElement.hasClass(ClassName.default))
      })

      it('highlights add-button when receiving input event', () => {
        titleInputElement.value = 'not empty'
        PageComponent.instance.handleUIEvent('input', undefined)
        assert.isTrue(addButtonElement.hasClass(ClassName.default))
      })

      it('does not highlight button if title is empty', () => {
        titleInputElement.value = ''

        PageComponent.instance.handleUIEvent('focus', undefined)
        assert.isFalse(addButtonElement.hasClass(ClassName.default))

        PageComponent.instance.handleUIEvent('input', undefined)
        assert.isFalse(addButtonElement.hasClass(ClassName.default))
      })
    })

    describe('when highlighted', () => {

      beforeEach(() => {
        addButtonElement.addClass(ClassName.default)
      })

      it('unhighlights button if title is empty', () => {
        titleInputElement.value = ''

        PageComponent.instance.handleUIEvent('input', undefined)
        assert.isFalse(addButtonElement.hasClass(ClassName.default))
      })

      it('unhighlights button when receiving blur event', () => {
        titleInputElement.value = 'not empty'

        PageComponent.instance.handleUIEvent('blur', undefined)
        assert.isFalse(addButtonElement.hasClass(ClassName.default))
      })
    })
  })

  describe('rendering', () => {

    beforeEach(() => {
      itemListElement.innerHTML = ''
    })

    it('adds item-components when receiving items', async () => {
      // NOTE: Cannot refer to ItemType or Progress here.
      // It freezes the test for unknown reason.
      const items = [
        {
          id: '1',
          type: 'Task',
          title: 'a task',
          progress: 'notStarted',
        },
      ]

      // TODO: This waits for a .5s animation
      await PageComponent.instance.handleUIEvent('items_added', { items })
      assert.exists(ItemComponent.forId('1'), 'component 1 should exist after adding items')
      assert.equal(itemListElement.childElementCount, 1)
    })
  })
})

function getElementById<T extends HTMLElement>(id: string): T {
  return document.getElementById(id) as T
}

async function renderPageComponent() {
  const html = await render('page-component', {})
  document.body.innerHTML = html
}
