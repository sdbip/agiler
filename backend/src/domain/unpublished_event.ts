export class UnpublishedEvent {
  readonly name: string
  readonly details: any
  
  constructor(name: string, details: any) {
    this.name = name
    this.details = details
  }
}
