import { render } from './Templates'

(async () => {
  const tasks = {
    tasks: [
      { title: 'Do the first thing' },
      { title: 'Do the second thing' },
      { title: 'Do the third thing' },
    ],
  }
  
  const taskListElement = document.getElementById('task-list')  
  if (taskListElement) {
    const templateURL = new URL('./task-list.mustache', import.meta.url)
    taskListElement.innerHTML = await render(templateURL, tasks)
  }
})()
