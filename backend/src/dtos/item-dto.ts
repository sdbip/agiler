import { ItemType, Progress } from './enums'

export type ItemDTO = {
  readonly id: string
  readonly type: ItemType
  readonly title: string
  readonly progress: Progress
  readonly assignee?: string
  readonly parentId?: string
}
