import { Item, ItemType } from '../../src/domain/item'
import { EntityVersion, PublishedEvent } from '../../src/es/source'

export const reconstituteStory = (id: string) => {
  return Item.reconstitute(id, EntityVersion.new, [
    new PublishedEvent('TypeChanged', JSON.stringify({ type: ItemType.Story })),
  ])
}

export const reconstituteTask = (id: string) => {
  return Item.reconstitute(id, EntityVersion.new, [])
}
