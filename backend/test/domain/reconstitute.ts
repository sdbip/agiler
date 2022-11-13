import { Item } from '../../src/domain/item'
import { ItemEvent, ItemType } from '../../src/domain/enums'
import { EntityVersion, PublishedEvent } from '../../src/es/source'

export const reconstituteStory = (id: string) =>
  Item.reconstitute(id, EntityVersion.new, [
    new PublishedEvent(ItemEvent.Created, JSON.stringify({ type: ItemType.Story })),
  ])

export const reconstituteStoryWithChildren = (childIds: string[], id: string) =>
  Item.reconstitute(id, EntityVersion.new, [
    new PublishedEvent(ItemEvent.Created, JSON.stringify({ type: ItemType.Story })),
    new PublishedEvent(ItemEvent.ChildrenAdded, JSON.stringify({ children: childIds })),
  ])

export const reconstituteTask = (id: string) =>
  Item.reconstitute(id, EntityVersion.new, [])

export const reconstituteTaskWithParent = (parentId: string, id: string) =>
  Item.reconstitute(id, EntityVersion.new, [
    new PublishedEvent(ItemEvent.ParentChanged, JSON.stringify({ parent: parentId })),
  ])

export const reconstituteFeature = (id: string) =>
  Item.reconstitute(id, EntityVersion.new, [
    new PublishedEvent(ItemEvent.Created, JSON.stringify({ type: ItemType.Feature })),
  ])

export const reconstitute = {
  feature: reconstituteFeature,
  story: reconstituteStory,
  storyWithChildren: reconstituteStoryWithChildren,
  task: reconstituteTask,
  taskWithParent: reconstituteTaskWithParent,
}
