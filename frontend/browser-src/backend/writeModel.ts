import { env } from './webpack_env'

const baseURL = env.writeModelURL

export const addFeature = async (title: string, parentId?: string) =>
  addItem(title, 'Feature', parentId)

export const addTask = async (title: string, parentId?: string) =>
  addItem(title, 'Task', parentId)

const addItem = async (title: string, type: string, parentId?: string) => {
  const url = parentId
    ? `${baseURL}/item/${parentId}/child`
    : `${baseURL}/item`

  const body = JSON.stringify({ title, type })
  console.log(`POST ${url}  body: ${body}`)

  const response = await fetch(url, {
    method: 'POST',
    body,
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

export const completeTask = async (id: string) => {
  console.log(`PATCH ${baseURL}/item/${id}/complete`)

  await fetch(`${baseURL}/item/${id}/complete`, { method: 'PATCH' })
}

export default {
  completeTask,
  addTask,
  promoteTask,
}
