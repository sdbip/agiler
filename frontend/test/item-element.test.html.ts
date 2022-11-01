import { runTests } from '@web/test-runner-mocha'
import { expect } from '@esm-bundle/chai'
import { ItemComponent, PageComponent } from '../src/item-component'

runTests(() => {
  it('finds itself', () => {
    expect(ItemComponent.forId('task')?.element).to.exist
    expect(ItemComponent.forId('story')?.element).to.exist
    expect(ItemComponent.forId('subtask')?.element).to.exist
    expect(ItemComponent.forId('no-task')).to.not.exist
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
  it('finds spinner element', () => {
    expect(ItemComponent.forId('story')?.spinnerElement).to.exist
  })
})
