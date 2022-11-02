import globals from './globals'
import readModel from './readModel'
import writeModel from './writeModel'
import { delay } from './delay'
import { DOMElement } from './dom-element'
import { ItemComponent } from './item-component'
import { PageComponent } from './page-component'
import { MeasureComponent } from './measure-component'
import { ClassName } from './class-name'
import { UIEventArgs } from './ui-event-args'

updateItems()

// EVENT HANDLERS

globals.emitUIEvent = (name: string, args: UIEventArgs) => {
  const component = ItemComponent.forId(args.itemId) ?? PageComponent.instance
  component.handleUIEvent(name, args)
}

type EventArgs<
  EventType extends Event | void
> = { event: EventType, id: string }

globals.completeTask = async function ({ id }: EventArgs<MouseEvent>) {

  const taskComponent = ItemComponent.forId(id)
  if (!taskComponent) throw new Error(`Component for task with id ${id} not found`)

  await writeModel.completeTask(id)
  await delay(200)

  const storyComponent = taskComponent.parentComponent
  if (!storyComponent) return updateItems()

  const collapsible = storyComponent.collapsible
  if (!collapsible) return

  await updateChildItems(storyComponent)
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

  await updateChildItems(storyComponent)
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
  if (isDisclosed) await updateChildItems(storyComponent)

  const collapsible = storyComponent.collapsible
  if (!collapsible) return

  collapsible.setHeight(0)

  if (isDisclosed) updateCollapsibleSize(collapsible)
}

// END EVENT HANDLERS

async function updateItems() {
  const items = await readModel.fetchItems()
  await PageComponent.instance.replaceChildItems(items)
}

const updateChildItems = async (storyComponent: ItemComponent) => {
  await storyComponent.activateSpinnerDuring(async () => {
    const items = await readModel.fetchChildItems(storyComponent.itemId)
    await storyComponent.replaceChildItems(items)
  })
}

const updateCollapsibleSize = (collapsible: DOMElement) => {
  const intrinsicSize = MeasureComponent.instance.measure(collapsible.innerHTML)
  collapsible.setHeight(intrinsicSize.height)
}
