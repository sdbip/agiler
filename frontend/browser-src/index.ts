import globals from './globals'
import readModel from './readModel'
import writeModel from './writeModel'
import { delay } from './delay'
import { ItemComponent } from './item-component'
import { PageComponent } from './page-component'
import { ClassName } from './class-name'
import { UIEventArgs } from './ui-event-args'
import { render } from './Templates'

(async () => {
  const pageContainer = document.getElementById('page-container')
  if (!pageContainer) throw Error('page container not found')
  pageContainer.innerHTML = await render('page-component', {})
  updateItems()
})()

// EVENT HANDLERS

globals.emitUIEvent = async (name: string, args: UIEventArgs) => {
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

function notifyUI(event: string, itemId?: string, args?: any) {
  const component = (itemId ? ItemComponent.forId(itemId) : undefined) ?? PageComponent.instance
  component.handleUIEvent(event, args)
}

const completeTask = async ({ id }: { id: string }) => {

  await writeModel.completeTask(id)
  await delay(200)
  notifyUI('task-completed', id)

  const itemComponent = ItemComponent.forId(id)
  if (!itemComponent) throw new Error(`Component for task with id ${id} not found`)
  await updateItems(itemComponent.parentComponent?.itemId)
}

const addTask = async ({ id }: { id: string }) => {
  const component = ItemComponent.forId(id) ?? PageComponent.instance
  const titleElement = component.titleInputElement
  if (!component.title) return

  console.log('add task', await writeModel.addTask(component.title, id))
  titleElement?.setInputElementValue('')

  await updateItems(component.itemId)
}

const promote = async ({ id }: { id: string }) => {
  await writeModel.promoteTask(id)
  await updateItems()
}

const toggleDisclosed = async ({ id }: { id: string }) => {
  const storyComponent = ItemComponent.forId(id)
  if (!storyComponent) throw new Error(`Component for story with id ${id} not found`)

  const wasDisclosed = storyComponent.element.hasClass(ClassName.disclosed)
  if (!wasDisclosed) await updateItems(id)
  notifyUI(wasDisclosed ? 'collapse' : 'disclose', id)
}

// END EVENT HANDLERS

async function updateItems(storyId?: string) {
  notifyUI('loading')
  try {
    const items = storyId
      ? await readModel.fetchChildItems(storyId)
      : await readModel.fetchItems()
    notifyUI('items-fetched', storyId, { items })
  } finally {
    notifyUI('loading-done')
  }
}
