import globals from './globals'
import { render } from './Templates'
import { addTask, completeTask, fetchTasks } from './backend'
import { delay } from './delay'
import { addClass, removeClass } from './class'
import { getElement, getElements } from './getElements'

updateTasks()

// EVENT HANDLERS

globals.toggle = async function(taskElement: HTMLDivElement | HTMLInputElement, event: MouseEvent) {
  if (event.target !== taskElement) return

  const wasCheckboxClicked = taskElement instanceof HTMLInputElement
  const checkbox = wasCheckboxClicked ? taskElement : getElements('input', taskElement)[0] as HTMLInputElement
  if (!wasCheckboxClicked) checkbox.checked = !checkbox.checked
  checkbox.disabled = true

  await completeTask(checkbox.id)
  await delay(200)
  await updateTasks()
}

globals.submitOnEnter = async function(titleInput: HTMLInputElement, event: KeyboardEvent) {
  if (event.metaKey || event.ctrlKey || event.altKey) return
  if (event.key !== 'Enter') return

  await doAddTask(titleInput)
}

globals.addTask = async function() { // (button: HTMLButtonElement, event: MouseEvent)
  const titleInput = getElement('#task-title') as HTMLInputElement
  if (!titleInput.value) return

  await doAddTask(titleInput)
}

async function doAddTask(titleInput: HTMLInputElement) {
  console.log('add task', await addTask(titleInput.value))
  titleInput.value = ''
  await updateTasks()
}

async function updateTasks() {
  const tasks = await fetchTasks()

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
