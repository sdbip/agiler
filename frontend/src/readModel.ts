import globals from './globals'

const baseURL = globals.READ_MODEL_URL

export const fetchItems = async () => {
  const response = await fetch(`${baseURL}/item`)
  return await response.json()
}

export const fetchChildItems = async (parentId: string) => {
  const response = await fetch(`${baseURL}/item/${parentId}/task`)
  return await response.json()
}

export default { fetchItems, fetchChildItems }
