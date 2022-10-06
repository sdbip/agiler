import globals from './globals'
import backend from './backend'
import { render } from './Templates'
import { delay } from './delay'
import { addClass, removeClass } from './class'
import { getElement, getElements } from './getElements'

updateTasks()

// EVENT HANDLERS

globals.toggle = async function(taskElement: HTMLDivElement | HTMLInputElement, event: MouseEvent) {
  if (event.target !== taskElement) return

  const wasCheckboxClicked = taskElement instanceof HTMLInputElement
  const checkbox = wasCheckboxClicked ? taskElement : getElement('input', taskElement) as HTMLInputElement
  if (!wasCheckboxClicked) checkbox.checked = !checkbox.checked
  checkbox.disabled = true

  await backend.completeTask(checkbox.id)
  await delay(200)
  await updateTasks()
}

globals.submitOnEnter = async function({ event }:{event: KeyboardEvent}) {
  if (event.metaKey || event.ctrlKey || event.altKey) return
  if (event.key !== 'Enter') return

  await globals.addTask()
}

globals.addTask = async function() {
  const titleInput = getElement('#task-title') as HTMLInputElement
  if (!titleInput.value) return
  
  console.log('add task', await backend.addTask(titleInput.value))
  titleInput.value = ''
  await updateTasks()
}

async function updateTasks() {
  const tasks = await backend.fetchTasks()

  const taskListElement = getElement('#task-list')  
  if (taskListElement) {
    const newTasks = findNewTasks(taskListElement, tasks)
    const oldElements = findObsoleteElements(taskListElement, tasks)

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    for (const element of oldElements) addClass(element.parentElement!, 'hidden')
    for (const task of newTasks) task.isNew = true

    await delay(500)
    taskListElement.innerHTML = await render('task-list', { tasks })
    await delay(1)

    for (const element of getElements('.hidden', taskListElement))
      removeClass(element, 'hidden')
  }
}

const findObsoleteElements = (taskListElement: HTMLElement, tasks: any[]) =>
  getElements('input', taskListElement)
    .filter(el => tasks.every((t: any) => t.id !== el.id))

const findNewTasks = (taskListElement: HTMLElement, tasks: any) => {
  const existingIds = getElements('input', taskListElement)
      .map(el => el.id)
  return tasks.filter((t: any) => existingIds.indexOf(t.id) < 0)
}
