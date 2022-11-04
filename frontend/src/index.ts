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

globals.emitUIEvent = async (name: string, args: UIEventArgs) => {
  console.log('emitUIEvent', name, args)
  switch (name) {
    case 'focus':
    case 'input':
    case 'blur':
      notifyUI(name, args.itemId, args)
      break
    case 'complete-clicked':
      await completeTask({ id: args.itemId })
      break
    case 'promote-clicked':
      await promote({ id: args.itemId })
      break
    case 'title-keydown':
      if (isEnterPressed(args.event as KeyboardEvent))
        await addTask({ id: args.itemId })
      break
    case 'add-button-clicked':
      await addTask({ id: args.itemId })
      break
    case 'disclosure-button-clicked':
      await toggleDisclosed({ id: args.itemId })
      break
  }

  function isEnterPressed(event: KeyboardEvent) {
    if (event.metaKey || event.ctrlKey || event.altKey) return false
    return event.key === 'Enter'
  }
}

const notifyUI = (event: string, itemId: string, args?: any) => {
  const component = ItemComponent.forId(itemId) ?? PageComponent.instance
  component.handleUIEvent(event, args)
}

const completeTask = async ({ id }: {id:string}) => {

  await writeModel.completeTask(id)
  await delay(200)
  notifyUI('task-completed', id)

  const taskComponent = ItemComponent.forId(id)
  if (!taskComponent) throw new Error(`Component for task with id ${id} not found`)
  const storyComponent = taskComponent.parentComponent
  if (!storyComponent) return updateItems()

  const collapsible = storyComponent.collapsible
  if (!collapsible) return

  await updateChildItems(storyComponent)
  updateCollapsibleSize(collapsible)
}

const addTask = async ({ id }: {id:string}) => {
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

const promote = async ({ id }: {id:string}) => {
  await writeModel.promoteTask(id)
  await updateItems()
}

const toggleDisclosed = async ({ id }: {id:string}) => {

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
  notifyUI('loading', storyComponent.itemId)
  try {
    const items = await readModel.fetchChildItems(storyComponent.itemId)
    notifyUI('items-fetched', storyComponent.itemId, { items })
    // TODO: Remove this call when measuring works without it
    await storyComponent.replaceChildItems(items)
  } finally {
    notifyUI('loading-done', storyComponent.itemId)
  }
}

const updateCollapsibleSize = (collapsible: DOMElement) => {
  const intrinsicSize = MeasureComponent.instance.measure(collapsible.innerHTML)
  collapsible.setHeight(intrinsicSize.height)
}
