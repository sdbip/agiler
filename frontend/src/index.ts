import globals from './globals'
import { render } from './Templates'
import { addTask, completeTask, fetchTasks } from './backend'

updateTasks()

// EVENT HANDLERS

globals.toggle = async function(taskElement: HTMLDivElement | HTMLInputElement, event: MouseEvent) {
  if (event.target !== taskElement) return

  const wasCheckboxClicked = taskElement instanceof HTMLInputElement
  const checkbox = wasCheckboxClicked ? taskElement : taskElement.getElementsByTagName('input')[0]
  if (!wasCheckboxClicked) checkbox.checked = !checkbox.checked
  checkbox.disabled = true

  await completeTask(checkbox.id)
  await delay(1000)
  await updateTasks()
}

globals.addTask = async function() { // (button: HTMLButtonElement, event: MouseEvent)
  const titleInput = document.getElementById('task-title') as HTMLInputElement
  if (!titleInput.value) return

  console.log('add task', await addTask(titleInput.value))
  titleInput.value = ''
  await updateTasks()
}

async function updateTasks() {
  const tasks = await fetchTasks()

  const taskListElement = document.getElementById('task-list')  
  if (taskListElement) {
    const newTasks = findNewTasks(taskListElement, tasks)
    const oldElements = findObsoleteElements(taskListElement, tasks)

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    for (const element of oldElements) element.parentElement!.className = 'task hidden'
    for (const task of newTasks) task.isNew = true

    await(delay(1000))

    taskListElement.innerHTML = await render('task-list', { tasks })

    await(delay(1))
    for (const element of [ ...taskListElement.getElementsByClassName('hidden') ])
      element.className = 'task'
  }
}

function findObsoleteElements(taskListElement: HTMLElement, tasks: any) {
  return [ ...taskListElement.getElementsByTagName('input') ]
    .filter(el => [ ...tasks ].every((t: any) => t.id !== el.id))
}

function findNewTasks(taskListElement: HTMLElement, tasks: any) {
  const existingIds = [ ...taskListElement.getElementsByTagName('input') ]
    .map((el: HTMLElement) => el.id)
  return tasks.filter((t: any) => existingIds.indexOf(t.id) < 0)
}

function delay(millis: number) {
  return new Promise<void>(resolve => {
      setTimeout(() => {
          resolve()
      }, millis)
  })
}
