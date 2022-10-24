import globals from './globals'

const baseURL = globals.WRITE_MODEL_URL

export const completeTask = async (id: string)  =>{
  console.log(`PATCH ${baseURL}/item/${id}/complete`)

  await fetch(`${baseURL}/item/${id}/complete`, { method: 'PATCH' })
}

export const addTask = async (title: string) => {
  console.log(`POST ${baseURL}/item  body: {"title":"${title}"}`)

  const response = await fetch(`${baseURL}/item`, {
    method: 'POST',
    body: JSON.stringify({ title }),
    headers: {
        'Content-type': 'application/json; charset=UTF-8',
    },
  })
  return await response.json()
}

export const promoteTask = async (id: string) => {
  console.log(`PATCH ${baseURL}/item/${id}/promote`)

  await fetch(`${baseURL}/item/${id}/promote`, { method: 'PATCH' })
}

export default {
  completeTask,
  addTask,
  promoteTask,
}