import globals from './globals'
import readModel from './readModel'
import writeModel from './writeModel'
import { render } from './Templates'
import { delay } from './delay'
import { addClass, hasClass, removeClass, toggleClass } from './class'
import { getElement, getElements } from './getElements'

enum ClassName {
  disclosed = 'disclosed',
  hidden = 'hidden',
  inactive = 'inactive',
}

updateItems()

// EVENT HANDLERS

type EventArgs<
  ElementType extends HTMLElement | void,
  EventType extends Event | void
> = { element: ElementType, event: EventType, id: string }

globals.makeDefault = async ({ element, id }: EventArgs<HTMLInputElement, Event>) => {
  const itemElement = getItemElement(id)
  const button = itemElement
    ? getElement('button', itemElement)
    : getElement('#button')
  if (!button) return

  if (element.value)
    addClass(button, 'default')
  else
    removeClass(button, 'default')
}

globals.unmakeDefault = async ({ id }: EventArgs<HTMLElement, Event>) => {
  const itemElement = getItemElement(id)
  const button = itemElement
    ? getElement('button', itemElement)
    : getElement('#button')
  if (!button) return

  removeClass(button, 'default')
}

globals.completeTask = async function ({ element, id }: EventArgs<HTMLDivElement | HTMLInputElement, MouseEvent>) {

  const taskElement = getItemElementOrThrow(id)

  const wasCheckboxClicked = element instanceof HTMLInputElement
  const checkbox = wasCheckboxClicked ? element : getElement('input', taskElement) as HTMLInputElement
  checkbox.checked = true
  checkbox.disabled = true

  await writeModel.completeTask(id)
  await delay(200)

  const storyElement = getParentItemElement(taskElement)
  if (!storyElement) return updateItems()

  const parentId = getItemId(storyElement)
  const collapsible = getElement('.collapsible', storyElement)
  if (!collapsible) return

  await updateChildItems(parentId)
  collapsible.style.height = await measureIntrinsicHeight(collapsible)
}

globals.addTaskIfEnter = async function ({ event, id }: EventArgs<void, KeyboardEvent>) {
  if (event.metaKey || event.ctrlKey || event.altKey) return
  if (event.key !== 'Enter') return

  await globals.addTask({ id })
}

globals.addTask = async function ({ id }: EventArgs<HTMLElement, Event>) {
  const storyElement = getItemElement(id)
  const titleInput = storyElement
    ? getElement('.item-title', storyElement) as HTMLInputElement
    : getElement('#item-title') as HTMLInputElement
  if (!titleInput.value) return

  console.log('add task', await writeModel.addTask(titleInput.value, id))
  titleInput.value = ''
  if (!storyElement) return await updateItems()

  const collapsible = getElement('.collapsible', storyElement)
  if (!collapsible) return

  await updateChildItems(id)
  collapsible.style.height = await measureCollapsible(id)
}

globals.promote = async function ({ id }: EventArgs<HTMLElement, Event>) {
  await writeModel.promoteTask(id)
  await updateItems()
}

globals.toggleDisclosed = async function ({ id }: EventArgs<HTMLElement, Event>) {

  const storyElement = getItemElementOrThrow(id)

  const chevronElement = getElement('.chevron', storyElement)
  if (!chevronElement) return

  toggleClass(chevronElement, ClassName.disclosed)

  const isDisclosed = hasClass(chevronElement, ClassName.disclosed)
  if (isDisclosed) await updateChildItems(id)

  await animateCollapsible(id, isDisclosed)
}

// END EVENT HANDLERS

async function updateItems() {
  const items = await readModel.fetchItems()

  const itemListElement = getElement('#item-list')
  if (itemListElement) {
    const newItems = findNewItems(itemListElement, items)
    const oldElements = findObsoleteElements(itemListElement, items)

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    for (const element of oldElements) addClass(element.parentElement!, 'hidden')
    for (const item of newItems) item.isNew = true

    await delay(500)
    await renderItems(items, itemListElement)
    await delay(1)

    for (const element of getElements('.hidden', itemListElement))
      removeClass(element, ClassName.hidden)
  }
}

const updateChildItems = async (parentId: string) => {
  const storyElement = getItemElementOrThrow(parentId)
  const spinner = getElement('.spinner', storyElement)
  if (spinner) removeClass(spinner, ClassName.inactive)

  const items = await readModel.fetchChildItems(parentId)
  const itemListElement = getElement('.item-list', storyElement)
  if (itemListElement) {
    await renderItems(items, itemListElement)

    if (spinner) addClass(spinner, ClassName.inactive)
  }
}

const findObsoleteElements = (itemListElement: HTMLElement, items: any[]) =>
  getElements('input', itemListElement)
    .filter(el => items.every((t: any) => t.id !== el.id))

const findNewItems = (itemListElement: HTMLElement, items: any) => {
  const existingIds = getElements('input', itemListElement)
    .map(el => el.id)
  return items.filter((t: any) => existingIds.indexOf(t.id) < 0)
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

const animateCollapsible = async (parentId: string, isDisclosed: boolean) => {
  const storyElement = getItemElementOrThrow(parentId)
  const collapsible = getElement('.collapsible', storyElement)
  if (!collapsible) return

  collapsible.style.height = '0'
  if (!isDisclosed) return

  collapsible.style.height = await measureCollapsible(parentId)
}

const measureCollapsible = async (parentId: string) => {
  const storyElement = getItemElementOrThrow(parentId)
  const collapsible = getElement('.collapsible', storyElement)
  return collapsible ? await measureIntrinsicHeight(collapsible) : '0'
}

const measureIntrinsicHeight = async (collapsible: HTMLElement) => {
  const origHeight = collapsible.style.height

  await delay(1)

  // Hide the element while measuring
  collapsible.style.visibility = 'hidden'
  collapsible.style.position = 'absolute'

  // Measure the intrinsic height
  collapsible.style.height = ''
  const intrinsicHeight = collapsible.offsetHeight

  // Restore the style so that the animation can start from zero
  collapsible.style.height = origHeight
  collapsible.style.visibility = ''
  collapsible.style.position = ''

  await delay(100)
  return `${intrinsicHeight}px`
}

const getItemId = (element: HTMLElement) => element.id.replace('item-', '')

const getItemElementOrThrow = (id: string) => {
  const element = getItemElement(id)
  if (!element) throw new Error(`element with id ${id} not found`)
  return element
}

const getItemElement = (id: string) => getElement(`#item-${id}`)

const getParentItemElement = (element: HTMLElement | null): HTMLElement | null => {
  const parent = element?.parentElement
  if (!parent) return null
  if (parent.id.startsWith('item-') &&
    !parent.id.startsWith('item-list')) return parent
  return getParentItemElement(parent)
}
