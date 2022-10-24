import { ItemType, Progress } from '../domain/item'
export { ItemType, Progress } from '../domain/item'

export type ItemDTO = {
  readonly id: string
  readonly type: ItemType
  readonly title: string
  readonly progress: Progress
  readonly assignee?: string
}
