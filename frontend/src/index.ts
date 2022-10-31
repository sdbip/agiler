import globals from './globals'
import readModel from './readModel'
import writeModel from './writeModel'
import { render } from './Templates'
import { delay } from './delay'
import { ItemListTransition } from './item-list-transition'
import { DOMElement } from './dom-element'

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
  const itemElement = getItemElement(id)
  const button = itemElement
    ? DOMElement.single('button', itemElement)
    : DOMElement.single('#button')
  if (!button) return

  const inputElement = itemElement
    ? DOMElement.single('.item-title', itemElement)
    : DOMElement.single('#item-title"')
  const title = inputElement?.inputElementValue
  if (title)
    button.addClass(ClassName.default)
  else
    button.removeClass(ClassName.default)
}

globals.unmakeDefault = async ({ id }: EventArgs<Event>) => {
  const itemElement = getItemElement(id)
  const button = itemElement
    ? DOMElement.single('button', itemElement)
    : DOMElement.single('#button')
  if (!button) return

  button.removeClass(ClassName.default)
}

globals.completeTask = async function ({ id }: EventArgs<MouseEvent>) {

  const taskElement = getItemElementOrThrow(id)

  await writeModel.completeTask(id)
  await delay(200)

  const storyElement = getParentItemElement(taskElement)
  if (!storyElement) return updateItems()

  const parentId = getItemId(storyElement)
  const collapsible = DOMElement.single('.collapsible', storyElement)
  if (!collapsible) return

  await updateChildItems(parentId)
  updateCollapsibleSize(collapsible)
}

globals.addTaskIfEnter = async function ({ event, id }: EventArgs<KeyboardEvent>) {
  if (event.metaKey || event.ctrlKey || event.altKey) return
  if (event.key !== 'Enter') return

  await globals.addTask({ id })
}

globals.addTask = async function ({ id }: EventArgs<Event>) {
  const storyElement = getItemElement(id)
  const titleElement = storyElement
    ? DOMElement.single('.item-title', storyElement)
    : DOMElement.single('#item-title')
  const title = titleElement?.inputElementValue
  if (!title) return

  console.log('add task', await writeModel.addTask(title, id))
  titleElement.setInputElementValue('')
  if (!storyElement) return await updateItems()

  const collapsible = DOMElement.single('.collapsible', storyElement)
  if (!collapsible) return

  await updateChildItems(id)
  updateCollapsibleSize(collapsible)
}

globals.promote = async function ({ id }: EventArgs<Event>) {
  await writeModel.promoteTask(id)
  await updateItems()
}

globals.toggleDisclosed = async function ({ id }: EventArgs<Event>) {

  const storyElement = getItemElementOrThrow(id)
  storyElement.toggleClass(ClassName.disclosed)

  const isDisclosed = storyElement.hasClass(ClassName.disclosed)
  if (isDisclosed) await updateChildItems(id)

  const collapsible = DOMElement.single('.collapsible', storyElement)
  if (!collapsible) return

  collapsible.setHeight(0)

  if (isDisclosed) updateCollapsibleSize(collapsible)
}

// END EVENT HANDLERS

async function updateItems() {
  const items = await readModel.fetchItems()

  const itemListElement = DOMElement.single('#item-list')
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
  const storyElement = getItemElementOrThrow(parentId)
  const spinner = DOMElement.single('.spinner', storyElement)
  if (spinner) spinner.removeClass(ClassName.inactive)

  const items = await readModel.fetchChildItems(parentId)
  const itemListElement = DOMElement.single('.item-list', storyElement)
  if (itemListElement) {
    await renderItems(items, itemListElement)
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

const getItemElementOrThrow = (id: string) => {
  const element = getItemElement(id)
  if (!element) throw new Error(`element with id ${id} not found`)
  return element
}

const getItemElement = (id: string) => DOMElement.single(`#item-${id}`)

const getParentItemElement = (element: DOMElement): DOMElement | null => {
  const parent = element?.parentElement
  if (!parent) return null
  if (parent.id.startsWith('item-') &&
    !parent.id.startsWith('item-list')) return parent
  return getParentItemElement(parent)
}

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
