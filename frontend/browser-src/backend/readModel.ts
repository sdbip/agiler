import { ItemDTO } from '../../../backend/src/dtos/item-dto'
import { env } from './webpack_env'

const baseURL = env.readModelURL

export const fetchItems = async () => {
  const response = await fetch(`${baseURL}/item`)
  return await response.json()
}

export const fetchChildItems = async (parentId: string): Promise<ItemDTO[]> => {
  const response = await fetch(`${baseURL}/item/${parentId}/task`)
  return await response.json()
}

export default { fetchItems, fetchChildItems }
