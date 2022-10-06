import globals from './globals'

const baseURL = globals.BACKEND_URL

export const fetchTasks = async () => {
  const response = await fetch(`${baseURL}/task`)
  return await response.json()
}

export const completeTask = async (id: string)  =>{
  console.log(`PATCH ${baseURL}/task/${id}/complete`)

  await fetch(`${baseURL}/task/${id}/complete`, { method: 'PATCH' })
}

export const addTask = async (title: string) => {
  console.log(`POST ${baseURL}/task  body: {"title":"${title}"}`)

  const response = await fetch(`${baseURL}/task`, {
    method: 'POST',
    body: JSON.stringify({ title }),
    headers: {
        'Content-type': 'application/json; charset=UTF-8',
    },
  })
  return await response.json()
}

export default {
  fetchTasks,
  completeTask,
  addTask,
}
