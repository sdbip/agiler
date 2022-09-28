import { render } from './Templates'

(async () => {
  const tasks = await fetchTasks()

  const taskListElement = document.getElementById('task-list')  
  if (taskListElement) {
    taskListElement.innerHTML = await render('task-list', { tasks })
  }
})()

async function fetchTasks() {
  const response = await fetch('http://localhost:8000/task')
  return await response.json()
}
