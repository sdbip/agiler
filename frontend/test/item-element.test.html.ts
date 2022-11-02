import { runTests } from '@web/test-runner-mocha'
import { expect } from '@esm-bundle/chai'
import { ItemComponent } from '../src/item-component'
import { PageComponent } from '../src/page-component'
import { DOMElement } from '../src/dom-element'
import { ClassName, toSelector } from '../src/class-name'

runTests(() => {
  it('finds itself', () => {
    expect(ItemComponent.forId('task')?.element).to.exist
    expect(ItemComponent.forId('story')?.element).to.exist
    expect(ItemComponent.forId('subtask')?.element).to.exist
    expect(ItemComponent.forId('no-task')).to.not.exist
  })
  it('knows item id', () => {
    expect(ItemComponent.forId('story')?.itemId).to.equal('story')
    expect(ItemComponent.forId('subtask')?.itemId).to.equal('subtask')
    expect(ItemComponent.forId('task')?.itemId).to.equal('task')
  })

  it('finds parent component', () => {
    expect(ItemComponent.forId('subtask')?.parentComponent).to.exist
    expect(ItemComponent.forId('task')?.parentComponent).to.not.exist
  })
  it('finds title element', () => {
    expect(PageComponent.instance.titleInputElement).to.exist
    expect(PageComponent.instance.title).to.equal('New task')

    const storyElement = ItemComponent.forId('story')
    expect(storyElement?.titleInputElement).to.exist
    expect(storyElement?.title).to.equal('New subtask')
  })
  it('finds add-button element', () => {
    expect(PageComponent.instance.addButtonElement).to.exist
    expect(ItemComponent.forId('story')?.addButtonElement).to.exist
  })
  it('finds collapsible element', () => {
    expect(ItemComponent.forId('story')?.collapsible).to.exist
  })
  it('finds item-list element', () => {
    expect(PageComponent.instance.itemListElement).to.exist
    expect(ItemComponent.forId('story')?.itemListElement).to.exist
  })
  it('finds spinner element', async () => {
    const component = ItemComponent.forId('story')
    let didDoIt = false
    await component?.activateSpinnerDuring(async () => {
      const spinnerElement = DOMElement.single(toSelector('.spinner'))
      expect(spinnerElement?.hasClass(ClassName.inactive)).is.false
      didDoIt = true
    })

    expect(didDoIt).is.true
  })
})
