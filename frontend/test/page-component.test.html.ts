import { runTests } from '@web/test-runner-mocha'
import { expect } from '@esm-bundle/chai'
import { PageComponent } from '../src/page-component'
import { render, setBaseURL } from '../src/Templates'
import { ClassName } from '../src/class-name'
import { ItemComponent } from '../src/item-component'

runTests(() => {
  let titleInputElement: HTMLInputElement
  let addButtonElement: HTMLButtonElement
  let itemListElement: HTMLDivElement

  before(async () => {
    setBaseURL('..')
    await renderPageComponent()

    titleInputElement = getElementById('item-title')
    addButtonElement = getElementById('add-button')
    itemListElement = getElementById('item-list')
  })

  it('gets its title from the title element', () => {
    titleInputElement.value = 'This is a title'
    expect(PageComponent.instance.title).to.equal('This is a title')
  })

  describe('add-button styling', () => {

    beforeEach(() => {
      addButtonElement.className = ''
    })

    it('highlights add-button when receiving focus event', () => {
      titleInputElement.value = 'not empty'
      PageComponent.instance.handleUIEvent('focus', undefined)
      expect(addButtonElement.className).to.equal(ClassName.default.name)
    })

    it('highlights add-button when receiving input event', () => {
      titleInputElement.value = 'not empty'
      PageComponent.instance.handleUIEvent('input', undefined)
      expect(addButtonElement.className).to.equal(ClassName.default.name)
    })

    it('does not highlight button if title is empty', () => {
      titleInputElement.value = ''

      PageComponent.instance.handleUIEvent('focus', undefined)
      expect(addButtonElement.className).to.equal('')

      PageComponent.instance.handleUIEvent('input', undefined)
      expect(addButtonElement.className).to.equal('')
    })
  })

  describe('add-button styling', () => {

    beforeEach(() => {
      addButtonElement.className = ClassName.default.name
    })

    it('unhighlights button if title is empty', () => {
      titleInputElement.value = ''

      PageComponent.instance.handleUIEvent('input', undefined)
      expect(addButtonElement.className).to.equal('')
    })

    it('unhighlights button when receiving blur event', () => {
      titleInputElement.value = 'not empty'

      PageComponent.instance.handleUIEvent('blur', undefined)
      expect(addButtonElement.className).to.equal('')
    })
  })

  describe('rendering', () => {

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
      await PageComponent.instance.handleUIEvent('items-fetched', { items })
      expect(itemListElement.children).to.have.lengthOf(1)
      expect(ItemComponent.forId('1')).to.exist
    })
  })

  it('only adds one copy of each item component', async () => {
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

    // TODO: This waits for a .5s animation - twice!
    await PageComponent.instance.handleUIEvent('items-fetched', { items })
    await PageComponent.instance.handleUIEvent('items-fetched', { items })
    expect(itemListElement.children).to.have.lengthOf(1)
  })
})

function getElementById<T extends HTMLElement>(id: string): T {
  return document.getElementById(id) as T
}

async function renderPageComponent() {
  const html = await render('page-component', {})
  document.body.innerHTML = html
}
