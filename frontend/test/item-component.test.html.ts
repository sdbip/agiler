import { runTests } from '@web/test-runner-mocha'
import { assert } from '@esm-bundle/chai'
import { ItemComponent } from '../src/item-component'
import { PageComponent } from '../src/page-component'
import { DOMElement } from '../src/dom-element'
import { ClassName, toSelector } from '../src/class-name'

runTests(() => {
  it('finds itself', () => {
    assert.exists(ItemComponent.forId('task')?.element)
    assert.exists(ItemComponent.forId('story')?.element)
    assert.exists(ItemComponent.forId('subtask')?.element)
    assert.notExists(ItemComponent.forId('no-task'))
  })
  it('knows item id', () => {
    assert.equal(ItemComponent.forId('story')?.itemId, 'story')
    assert.equal(ItemComponent.forId('subtask')?.itemId, 'subtask')
    assert.equal(ItemComponent.forId('task')?.itemId, 'task')
  })

  it('finds parent component', () => {
    assert.exists(ItemComponent.forId('subtask')?.parentComponent)
    assert.notExists(ItemComponent.forId('task')?.parentComponent)
  })
  it('finds title element', () => {
    assert.exists(PageComponent.instance.titleInputElement)
    assert.equal(PageComponent.instance.title, 'New task')

    const storyElement = ItemComponent.forId('story')
    assert.exists(storyElement?.titleInputElement)
    assert.equal(storyElement?.title, 'New subtask')
  })
  it('finds add-button element', () => {
    assert.exists(PageComponent.instance.addButtonElement)
    assert.exists(ItemComponent.forId('story')?.addButtonElement)
  })
  it('finds collapsible element', () => {
    assert.exists(ItemComponent.forId('story')?.collapsible)
  })
  it('finds item-list element', () => {
    assert.exists(PageComponent.instance.itemListElement)
    assert.exists(ItemComponent.forId('story')?.itemListElement)
  })
  it('finds spinner element', async () => {
    const component = ItemComponent.forId('story')
    component?.handleUIEvent('loading')

    const spinnerElement = DOMElement.single(toSelector('.spinner'))
    assert.isFalse(spinnerElement?.hasClass(ClassName.inactive))
  })
})
