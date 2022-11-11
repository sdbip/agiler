import { randomUUID } from 'crypto'
import { failFast } from '../../../shared/src/failFast.js'
import {
  Entity,
  CanonicalEntityId,
  EntityVersion,
  UnpublishedEvent,
  PublishedEvent,
} from '../es/source.js'

export enum ItemType {
  Epic = 'Epic',
  Feature = 'Feature',
  Story = 'Story',
  Task = 'Task',
}

export enum ItemEvent {
  Created = 'Created',
  ChildrenAdded = 'ChildrenAdded',
  ChildrenRemoved = 'ChildrenRemoved',
  ParentChanged = 'ParentChanged',
  ProgressChanged = 'ProgressChanged',
  TypeChanged = 'TypeChanged',
  AssigneeChanged = 'AssigneeChanged',
}

type AddEvent =
  ((this: Item, event: ItemEvent.Created, details: { title: string, type: ItemType }) => void)
& ((this: Item, event: ItemEvent.TypeChanged, details: {type: ItemType}) => void)
& ((this: Item, event: ItemEvent.ChildrenAdded, details: { children: [ string ] }) => void)
& ((this: Item, event: ItemEvent.ChildrenRemoved, details: { children: [ string ] }) => void)
& ((this: Item, event: ItemEvent.ParentChanged, details: { parent: string|null }) => void)
& ((this: Item, event: ItemEvent.ProgressChanged, details: { progress: Progress }) => void)
& ((this: Item, event: ItemEvent.AssigneeChanged, details: { assignee: string }) => void)

export class Item extends Entity {
  itemType = ItemType.Task
  parent?: string

  promote() {
    failFast.unless(this.itemType === ItemType.Task, `Only ${ItemType.Task} items may be promoted`)

    this.itemType = ItemType.Story
    this.addNewEvent(ItemEvent.TypeChanged, { type: ItemType.Story })
  }

  add(item: Item) {
    failFast.unless(this.itemType !== ItemType.Task, `${ItemType.Task} items may not have children`)
    failFast.unless(item.parent === undefined, 'Item must not have other parent')
    if (this.itemType === ItemType.Story)
      failFast.unless(item.itemType === ItemType.Task, `Only ${ItemType.Task} items may be added`)

    this.addNewEvent(ItemEvent.ChildrenAdded, { children: [ item.id ] })
    if (this.itemType === ItemType.Feature)
      this.addNewEvent(ItemEvent.TypeChanged, { type: ItemType.Epic })

    item.removeEventMatching(e => e.name === ItemEvent.ParentChanged)
    item.addNewEvent(ItemEvent.ParentChanged, { parent: this.id })
  }

  remove(task: Item) {
    if (task.parent !== this.id) return
    task.parent = undefined
    this.addNewEvent(ItemEvent.ChildrenRemoved, { children: [ task.id ] })
    task.addNewEvent(ItemEvent.ParentChanged, { parent: null })
  }

  complete() {
    failFast.unless(this.itemType === ItemType.Task, `Only ${ItemType.Task} items may be completed`)

    this.addNewEvent(ItemEvent.ProgressChanged, { progress: Progress.completed })
  }

  assign(member: string) {
    failFast.unless(this.itemType === ItemType.Task, `Only ${ItemType.Task} items may be assigned`)

    this.addNewEvent(ItemEvent.AssigneeChanged, { assignee: member })
    this.addNewEvent(ItemEvent.ProgressChanged, { progress: Progress.inProgress })
  }

  static new(title: string, type?: ItemType): Item {
    const item = new Item(randomUUID(), EntityVersion.new)
    item.addNewEvent(ItemEvent.Created, { title, type: type ?? ItemType.Task })
    return item
  }

  static reconstitute(id: string, version: EntityVersion, events: PublishedEvent[]) {
    const item = new Item(id, version)
    for (const event of events) {
      switch (event.name) {
        case ItemEvent.Created:
        case ItemEvent.TypeChanged:
          item.itemType = event.details.type
          break
        case ItemEvent.ParentChanged:
          item.parent = event.details.parent
          break
        default: break
      }
    }
    return item
  }

  private constructor(id: string, version: EntityVersion) { super(new CanonicalEntityId(id, 'Item'), version) }

  private removeEventMatching(predicate: (e: UnpublishedEvent) => boolean) {
    const existingEvent = this.unpublishedEvents.findIndex(predicate)
    if (existingEvent < 0) return
    this.unpublishedEvents.splice(existingEvent, 1)
  }

  private addNewEvent: AddEvent = (event, details) => {
    this.addEvent(new UnpublishedEvent(event, details))
  }
}

export enum Progress {
  notStarted = 'notStarted',
  inProgress = 'inProgress',
  completed = 'completed',
}
