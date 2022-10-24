import globals from './globals'
import readModel from './readModel'
import writeModel from './writeModel'
import { render } from './Templates'
import { delay } from './delay'
import { addClass, removeClass } from './class'
import { getElement, getElements } from './getElements'

updateItems()

// EVENT HANDLERS

type EventArgs<
    ElementType extends HTMLElement | void,
    EventType extends Event | void
  > = {element: ElementType, event: EventType}

globals.toggle = async function({ element, event }: EventArgs<HTMLDivElement | HTMLInputElement, MouseEvent>) {
  if (event.target !== element) return

  const wasCheckboxClicked = element instanceof HTMLInputElement
  const checkbox = wasCheckboxClicked ? element : getElement('input', element) as HTMLInputElement
  if (!wasCheckboxClicked) checkbox.checked = !checkbox.checked
  checkbox.disabled = true

  await writeModel.completeTask(checkbox.id)
  await delay(200)
  await updateItems()
}

globals.addTaskIfEnter = async function({ event }: EventArgs<void, KeyboardEvent>) {
  if (event.metaKey || event.ctrlKey || event.altKey) return
  if (event.key !== 'Enter') return

  await globals.addTask()
}

globals.addTask = async function() {
  const titleInput = getElement('#item-title') as HTMLInputElement
  if (!titleInput.value) return
  
  console.log('add task', await writeModel.addTask(titleInput.value))
  titleInput.value = ''
  await updateItems()
}

globals.promote = async function({ element }: EventArgs<HTMLElement, Event>) {
  await writeModel.promoteTask(element.id.replace(/^promote-/, ''))
  await updateItems()
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
    itemListElement.innerHTML = await render('item-list', {
      items,
      canComplete: () => function(this: any, text: string, render: any) {
        return this.type === 'Task' ? render(text) : ''
      },
      canPromote: () => function(this: any, text: string, render: any) {
        return this.type === 'Task' ? render(text) : ''
      },
    })
    await delay(1)

    for (const element of getElements('.hidden', itemListElement))
      removeClass(element, 'hidden')
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
