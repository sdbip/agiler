import globals from './globals'
import { render } from './Templates'
import { addTask, completeTask, fetchTasks } from './backend'

(async () => {
  const tasks = await fetchTasks()
  
  const taskListElement = document.getElementById('task-list')  
  if (taskListElement) {
    taskListElement.innerHTML = await render('task-list', { tasks })
  }
})()

// EVENT HANDLERS
// TODO: The UI structure is not tested. Is it even possible?

globals.toggle = function(taskElement: HTMLDivElement | HTMLInputElement, event: MouseEvent) {
  if (event.target !== taskElement) return

  if (taskElement instanceof HTMLInputElement) {
    completeTask(taskElement.id)  
  } else {
    const checkbox = taskElement.getElementsByTagName('input')[0]
    checkbox.checked = !checkbox.checked
    completeTask(checkbox.id)
  }
}

globals.complete = function(inputElement: HTMLInputElement, event: MouseEvent) {
  if (event.target !== inputElement) return

  const checkbox = inputElement
  completeTask(checkbox.id)
}

globals.addTask = function() { // (button: HTMLButtonElement, event: MouseEvent)
  const titleInput = document.getElementById('task-title') as HTMLInputElement
  addTask(titleInput.value)
}
