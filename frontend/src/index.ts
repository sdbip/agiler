import { render } from './Templates'

(async () => {
  const tasks = await fetchTasks()

  const taskListElement = document.getElementById('task-list')  
  console.log('taskListElement', taskListElement)
  if (taskListElement) {
    taskListElement.innerHTML = await render('task-list', { tasks })
  }
})()

async function fetchTasks() {
  const response = await fetch('/api/task')
  return await response.json()
}
