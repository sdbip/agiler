import { ItemType, Progress } from '../domain/item'

export type ItemDTO = {
  get id(): string
  get type(): ItemType
  get title(): string
  get progress(): Progress
  get assignee(): string | null
}
