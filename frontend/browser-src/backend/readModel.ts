import { ItemDTO } from '../../../backend/src/dtos/item-dto'
import { env } from './webpack_env'

const baseURL = env.readModelURL

export const fetchItems = async () => {
  const response = await fetch(`${baseURL}/item`)
  return await response.json()
}

export const fetchChildItems = async (parentId: string): Promise<ItemDTO[]> => {
  const response = await fetch(`${baseURL}/item/${parentId}/child`)
  return await response.json()
}

export const fetchFeatures = async () => {
  const response = await fetch(`${baseURL}/item?type=Feature|Epic`)
  return await response.json()
}

export const fetchChildFeatures = async (parentId: string): Promise<ItemDTO[]> => {
  const response = await fetch(`${baseURL}/item/${parentId}/child?type=Feature|Epic`)
  return await response.json()
}

export default {
  fetchItems,
  fetchChildItems,
  fetchFeatures,
  fetchChildFeatures,
}
