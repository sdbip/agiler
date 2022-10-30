import globals from './globals'
import readModel from './readModel'
import writeModel from './writeModel'
import { render } from './Templates'
import { delay } from './delay'
import { ItemListTransition } from './item-list-transition'
import { HTML } from './html'

enum ClassName {
  disclosed = 'disclosed',
  hidden = 'hidden',
  inactive = 'inactive',
  default = 'default',
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const measure = HTML.single('#measure')!.element

updateItems()

// EVENT HANDLERS

type EventArgs<
  ElementType extends HTMLElement | void,
  EventType extends Event | void
> = { element: ElementType, event: EventType, id: string }

globals.makeDefault = async ({ element, id }: EventArgs<HTMLInputElement, Event>) => {
  const itemElement = getItemElement(id)
  const button = itemElement
    ? HTML.single('button', itemElement)
    : HTML.single('#button')
  if (!button) return

  if (element.value)
    button.addClass(ClassName.default)
  else
    button.removeClass(ClassName.default)
}

globals.unmakeDefault = async ({ id }: EventArgs<HTMLElement, Event>) => {
  const itemElement = getItemElement(id)
  const button = itemElement
    ? HTML.single('button', itemElement)
    : HTML.single('#button')
  if (!button) return

  button.removeClass(ClassName.default)
}

globals.completeTask = async function ({ element, id }: EventArgs<HTMLDivElement | HTMLInputElement, MouseEvent>) {

  const taskElement = getItemElementOrThrow(id)

  const wasCheckboxClicked = element instanceof HTMLInputElement
  const checkbox = wasCheckboxClicked ? element : HTML.single('input', taskElement)?.element as HTMLInputElement
  checkbox.checked = true
  checkbox.disabled = true

  await writeModel.completeTask(id)
  await delay(200)

  const storyElement = getParentItemElement(taskElement)
  if (!storyElement) return updateItems()

  const parentId = getItemId(storyElement)
  const collapsible = HTML.single('.collapsible', storyElement)
  if (!collapsible) return

  await updateChildItems(parentId)
  updateCollapsibleSize(collapsible.element)
}

globals.addTaskIfEnter = async function ({ event, id }: EventArgs<void, KeyboardEvent>) {
  if (event.metaKey || event.ctrlKey || event.altKey) return
  if (event.key !== 'Enter') return

  await globals.addTask({ id })
}

globals.addTask = async function ({ id }: EventArgs<HTMLElement, Event>) {
  const storyElement = getItemElement(id)
  const titleInput = storyElement
    ? HTML.single('.item-title', storyElement)?.element as HTMLInputElement
    : HTML.single('#item-title')?.element as HTMLInputElement
  if (!titleInput.value) return

  console.log('add task', await writeModel.addTask(titleInput.value, id))
  titleInput.value = ''
  if (!storyElement) return await updateItems()

  const collapsible = HTML.single('.collapsible', storyElement)
  if (!collapsible) return

  await updateChildItems(id)
  updateCollapsibleSize(collapsible.element)
}

globals.promote = async function ({ id }: EventArgs<HTMLElement, Event>) {
  await writeModel.promoteTask(id)
  await updateItems()
}

globals.toggleDisclosed = async function ({ id }: EventArgs<HTMLElement, Event>) {

  const storyElement = getItemElementOrThrow(id)
  storyElement.toggleClass(ClassName.disclosed)

  const isDisclosed = storyElement.hasClass(ClassName.disclosed)
  if (isDisclosed) await updateChildItems(id)

  const collapsible = HTML.single('.collapsible', storyElement)
  if (!collapsible) return

  collapsible.element.style.height = '0'

  if (isDisclosed) updateCollapsibleSize(collapsible.element)
}

// END EVENT HANDLERS

async function updateItems() {
  const items = await readModel.fetchItems()

  const itemListElement = HTML.single('#item-list')
  if (itemListElement) {
    const filter = new ItemListTransition([ ...itemListElement.element.children ], items)
    const taggedItems = filter.taggedItems
    const oldElements = filter.obsoleteElements

    for (const element of oldElements) new HTML(element as HTMLElement).addClass(ClassName.hidden)

    await delay(500)
    await renderItems(taggedItems, itemListElement.element)
    await delay(1)

    for (const html of HTML.all('.hidden', itemListElement))
      html.removeClass(ClassName.hidden)
  }
}

const updateChildItems = async (parentId: string) => {
  const storyElement = getItemElementOrThrow(parentId)
  const spinner = HTML.single('.spinner', storyElement)
  if (spinner) spinner.removeClass(ClassName.inactive)

  const items = await readModel.fetchChildItems(parentId)
  const itemListElement = HTML.single('.item-list', storyElement)
  if (itemListElement) {
    await renderItems(items, itemListElement.element)
    if (spinner) spinner.addClass(ClassName.inactive)
  }
}

const renderItems = async (items: any, itemListElement: HTMLElement) => {
  itemListElement.innerHTML = await render('item-list', {
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
  })
}

const getItemId = (element: HTML) => element.id.replace('item-', '')

const getItemElementOrThrow = (id: string) => {
  const element = getItemElement(id)
  if (!element) throw new Error(`element with id ${id} not found`)
  return element
}

const getItemElement = (id: string) => HTML.single(`#item-${id}`)

const getParentItemElement = (element: HTML): HTML | null => {
  const parent = element?.parent
  if (!parent) return null
  if (parent.id.startsWith('item-') &&
    !parent.id.startsWith('item-list')) return parent
  return getParentItemElement(parent)
}

const updateCollapsibleSize = (collapsible: HTMLElement) => {
  const intrinsicHeight = measureIntrinsicHeight(collapsible)
  collapsible.style.height = `${intrinsicHeight}px`
}

const measureIntrinsicHeight = (collapsible: HTMLElement) => {
  measure.innerHTML = collapsible.innerHTML
  for (const element of HTML.all('.hidden', new HTML(measure)))
    element.removeClass(ClassName.hidden)
  return measure.offsetHeight
}
