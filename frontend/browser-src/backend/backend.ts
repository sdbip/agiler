import { ItemDTO, ItemType } from './dtos'
import { env } from './webpack_env'

export class ReadModel {
  async fetchItem(id: string): Promise<ItemDTO | undefined> {
    const response = await fetch(`${env.readModelURL}/item/${id}`)
    if (!response.ok) throw new Error(`status ${response.status}\n${await response.text()}`)
    return await response.json()
  }

  async fetchItems(parentId: string | undefined, types: ItemType[]): Promise<ItemDTO[]> {
    const baseURL = parentId
      ? `${env.readModelURL}/item/${parentId}/child`
      : `${env.readModelURL}/item`
    const response = await fetch(`${baseURL}?type=${types.join('|')}`)
    if (!response.ok) throw new Error(`status ${response.status}\n${await response.text()}`)
    return await response.json()
  }
}

export class WriteModel {
  async addItem(title: string, type: ItemType, parentId: string | undefined): Promise<{ id: string }> {
    const url = parentId
      ? `${env.writeModelURL}/item/${parentId}/child`
      : `${env.writeModelURL}/item`

    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({ title, type }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    })
    if (!response.ok) throw new Error(`status ${response.status}\n${await response.text()}`)
    return await response.json()
  }

  async promoteTask(id: string): Promise<void> {
    await fetch(`${env.writeModelURL}/item/${id}/promote`, { method: 'PATCH' })
  }

  async completeTask(id: string): Promise<void> {
    await fetch(`${env.writeModelURL}/item/${id}/complete`, { method: 'PATCH' })
  }
}
