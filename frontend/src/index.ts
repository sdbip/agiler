import globals from './globals'
import readModel from './readModel'
import writeModel from './writeModel'
import { render } from './Templates'
import { delay } from './delay'
import { ItemListTransition } from './item-list-transition'
import { DOMElement } from './dom-element'
import { ItemComponent } from './item-component'
import { PageComponent } from './page-component'

enum ClassName {
  disclosed = 'disclosed',
  hidden = 'hidden',
  inactive = 'inactive',
  default = 'default',
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const measure = DOMElement.single('#measure')!

updateItems()

// EVENT HANDLERS

type EventArgs<
  EventType extends Event | void
> = { event: EventType, id: string }

globals.makeDefault = async ({ id }: EventArgs<Event>) => {
  const itemComponent = ItemComponent.forId(id)
  const button = itemComponent?.addButtonElement
  if (!button) return

  const component = itemComponent ?? PageComponent.instance
  const inputElement = component.titleInputElement
  if (inputElement?.inputElementValue)
    button.addClass(ClassName.default)
  else
    button.removeClass(ClassName.default)
}

globals.unmakeDefault = async ({ id }: EventArgs<Event>) => {
  const itemComponent = ItemComponent.forId(id)
  const button = itemComponent?.addButtonElement
  if (button) button.removeClass(ClassName.default)
}

globals.completeTask = async function ({ id }: EventArgs<MouseEvent>) {

  const taskComponent = ItemComponent.forId(id)
  if (!taskComponent) throw new Error(`Component for task with id ${id} not found`)

  await writeModel.completeTask(id)
  await delay(200)

  const storyComponent = taskComponent.parentComponent
  if (!storyComponent) return updateItems()

  const collapsible = storyComponent.collapsible
  if (!collapsible) return

  await updateChildItems(getItemId(storyComponent.element))
  updateCollapsibleSize(collapsible)
}

globals.addTaskIfEnter = async function ({ event, id }: EventArgs<KeyboardEvent>) {
  if (event.metaKey || event.ctrlKey || event.altKey) return
  if (event.key !== 'Enter') return

  await globals.addTask({ id })
}

globals.addTask = async function ({ id }: EventArgs<Event>) {
  const storyComponent = ItemComponent.forId(id)
  const component = storyComponent ?? PageComponent.instance
  const titleElement = component.titleInputElement
  if (!component.title) return

  console.log('add task', await writeModel.addTask(component.title, id))
  titleElement?.setInputElementValue('')

  const collapsible = storyComponent?.collapsible
  if (!collapsible) return await updateItems()

  await updateChildItems(id)
  updateCollapsibleSize(collapsible)
}

globals.promote = async function ({ id }: EventArgs<Event>) {
  await writeModel.promoteTask(id)
  await updateItems()
}

globals.toggleDisclosed = async function ({ id }: EventArgs<Event>) {

  const storyComponent = ItemComponent.forId(id)
  if (!storyComponent) throw new Error(`Component for story with id ${id} not found`)
  storyComponent.element.toggleClass(ClassName.disclosed)

  const isDisclosed = storyComponent.element.hasClass(ClassName.disclosed)
  if (isDisclosed) await updateChildItems(id)

  const collapsible = storyComponent.collapsible
  if (!collapsible) return

  collapsible.setHeight(0)

  if (isDisclosed) updateCollapsibleSize(collapsible)
}

// END EVENT HANDLERS

async function updateItems() {
  const items = await readModel.fetchItems()

  const itemListElement = PageComponent.instance.itemListElement
  if (itemListElement) {
    const filter = new ItemListTransition(itemListElement.children, items)
    const taggedItems = filter.taggedItems
    const oldElements = filter.obsoleteElements

    for (const element of oldElements) element.addClass(ClassName.hidden)

    await delay(500)
    await renderItems(taggedItems, itemListElement)
    await delay(1)

    for (const html of DOMElement.all('.hidden', itemListElement))
      html.removeClass(ClassName.hidden)
  }
}

const updateChildItems = async (parentId: string) => {
  const storyComponent = ItemComponent.forId(parentId)
  if (!storyComponent) throw new Error(`Component for story with id ${parentId} not found`)

  const spinner = storyComponent.spinnerElement
  if (spinner) spinner.removeClass(ClassName.inactive)

  const items = await readModel.fetchChildItems(parentId)
  const itemListElement = storyComponent.itemListElement
  if (itemListElement) {
    await renderItems(items, itemListElement)
    await delay(500)
    if (spinner) spinner.addClass(ClassName.inactive)
  }
}

const renderItems = async (items: any, itemListElement: DOMElement) => {
  itemListElement.setInnerHTML(await render('item-list', {
    items,
    canComplete: () => function (this: any, text: string, render: any) {
      return this.type === 'Task' ? render(text) : ''
    },
    canPromote: () => function (this: any, text: string, render: any) {
      return this.type === 'Task' ? render(text) : ''
    },
    hasChildren: () => function (this: any, text: string, render: any) {
      return this.type !== 'Task' ? render(text) : ''
    },
  }))
}

const getItemId = (element: DOMElement) => element.id.replace('item-', '')

const updateCollapsibleSize = (collapsible: DOMElement) => {
  const intrinsicHeight = measureIntrinsicHeight(collapsible)
  collapsible.setHeight(intrinsicHeight)
}

const measureIntrinsicHeight = (collapsible: DOMElement) => {
  measure.setInnerHTML(collapsible.innerHTML)
  for (const element of DOMElement.all('.hidden', measure))
    element.removeClass(ClassName.hidden)
  return measure.offsetHeight
}
