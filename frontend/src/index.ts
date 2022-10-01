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

  await completeTask(checkbox.id)
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
    taskListElement.innerHTML = await render('task-list', { tasks })
  }
}
