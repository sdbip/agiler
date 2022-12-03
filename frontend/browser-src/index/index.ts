import globals from '../globals'
import { delay } from '../delay'
import { ItemComponent } from '../item-component'
import { PageComponent } from '../page-component'
import { ClassName } from '../class-name'
import { UIEventArgs } from './ui-event-args'
import { render } from '../templates'
import { ItemCache, ItemCacheEvent } from '../item-cache'
import { Backend } from '../backend/backend'
import { ItemType } from '../backend/dtos'

(async () => {
  const pageContainer = document.getElementById('page-container')
  if (!pageContainer) throw Error('page container not found')
  pageContainer.innerHTML = await render('page-component', {})
  updateItems()
})()

const cache = new ItemCache(new Backend())

// EVENT HANDLERS

cache.on(ItemCacheEvent.ItemsAdded, items => {
  notifyUI('items_added', items[0].parentId, { items })
})

cache.on(ItemCacheEvent.ItemsChanged, items => {
  for (const item of items)
    notifyUI('item_changed', item.id, { item })
})

cache.on(ItemCacheEvent.ItemsRemoved, items => {
  for (const item of items)
    notifyUI('item_removed', item.id, { item })
})

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

  await cache.completeTask(id)
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

  console.log('add task', await cache.addItem(ItemType.Task, component.title, id))
  titleElement?.setInputElementValue('')

  await updateItems(component.itemId)
}

const promote = async ({ id }: { id: string }) => {
  await cache.promoteTask(id)
  await updateItems()
}

const toggleDisclosed = async ({ id }: { id: string }) => {
  // TODO: notifyUI instead
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
    await cache.fetchItems(storyId, [ ItemType.Story, ItemType.Task ])
  } finally {
    notifyUI('loading-done')
  }
}
