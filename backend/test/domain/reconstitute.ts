import { Item, ItemType } from '../../src/domain/item'
import { EntityVersion, PublishedEvent } from '../../src/es/source'

export const reconstituteStory = (id: string) =>
  Item.reconstitute(id, EntityVersion.new, [
    new PublishedEvent('TypeChanged', JSON.stringify({ type: ItemType.Story })),
  ])

export const reconstituteStoryWithChildren = (childIds: string[], id: string) =>
  Item.reconstitute(id, EntityVersion.new, [
    new PublishedEvent('TypeChanged', JSON.stringify({ type: ItemType.Story })),
    new PublishedEvent('ChildrenAdded', JSON.stringify({ children: childIds })),
  ])

export const reconstituteTask = (id: string) =>
  Item.reconstitute(id, EntityVersion.new, [])

export const reconstituteTaskWithParent = (parentId: string, id: string) =>
  Item.reconstitute(id, EntityVersion.new, [
    new PublishedEvent('ParentChanged', JSON.stringify({ parent: parentId })),
  ])

export const reconstituteFeature = (id: string) =>
  Item.reconstitute(id, EntityVersion.new, [
    new PublishedEvent('Created', JSON.stringify({ type: ItemType.Feature })),
  ])
