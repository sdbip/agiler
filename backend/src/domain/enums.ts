export enum ItemEvent {
  Created = 'Created',
  ChildrenAdded = 'ChildrenAdded',
  ChildrenRemoved = 'ChildrenRemoved',
  ParentChanged = 'ParentChanged',
  ProgressChanged = 'ProgressChanged',
  TypeChanged = 'TypeChanged',
  AssigneeChanged = 'AssigneeChanged',
}

export enum ItemType {
  Epic = 'Epic',
  Feature = 'Feature',
  Story = 'Story',
  Task = 'Task'
}

export enum Progress {
  notStarted = 'notStarted',
  inProgress = 'inProgress',
  completed = 'completed'
}
