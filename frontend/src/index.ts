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
  > = {element: ElementType, event: EventType, id: string}

globals.completeTask = async function({ element, event, id }: EventArgs<HTMLDivElement | HTMLInputElement, MouseEvent>) {
  if (event.target !== element) return

  const wasCheckboxClicked = element instanceof HTMLInputElement
  const checkbox = wasCheckboxClicked ? element : getElement('input', element) as HTMLInputElement
  if (!wasCheckboxClicked) checkbox.checked = !checkbox.checked
  checkbox.disabled = true

  await writeModel.completeTask(id)
  await delay(200)
  await updateItems()
}

globals.addTaskIfEnter = async function({ event, id }: EventArgs<void, KeyboardEvent>) {
  if (event.metaKey || event.ctrlKey || event.altKey) return
  if (event.key !== 'Enter') return

  await globals.addTask({ id })
}

globals.addTask = async function({ id }: EventArgs<HTMLElement, Event>) {
  const titleInput = getElement(id ? `#item-title-${id}` : '#item-title') as HTMLInputElement
  if (!titleInput.value) return

  console.log('add task', await writeModel.addTask(titleInput.value, id))
  titleInput.value = ''
  await updateItems()
}

globals.promote = async function({ id }: EventArgs<HTMLElement, Event>) {
  await writeModel.promoteTask(id)
  await updateItems()
}

globals.toggleDisclosed = async function({ element, id }: EventArgs<HTMLElement, Event>) {

  toggleClass(element, ClassName.disclosed)

  const isDisclosed = hasClass(element, ClassName.disclosed)
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
  const storyElement = getElement(`#item-${parentId}`)
  const spinner = storyElement && getElement('.spinner', storyElement)
  if (spinner) removeClass(spinner, ClassName.inactive)

  const items = await readModel.fetchChildItems(parentId)

  const itemListElement = getElement(`#item-list-${parentId}`)
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
  const collapsible = getElement(`#collapsible-story-${parentId}`)
  if (!collapsible) return

  collapsible.style.height = '0'
  if (!isDisclosed) return

  await delay(1)
  // Hide the element while measuring
  collapsible.style.visibility = 'hidden'
  collapsible.style.position = 'absolute'

  // Measure the intrinsic height
  collapsible.style.height = ''
  const intrinsicHeight = collapsible.offsetHeight

  // Restore the style so that the animation can start from zero
  collapsible.style.height = '0'
  collapsible.style.visibility = ''
  collapsible.style.position = ''

  await delay(100)
  collapsible.style.height = `${intrinsicHeight}px`
}
