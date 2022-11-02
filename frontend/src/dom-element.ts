import { failFast } from '../../shared/src/failFast'
import { ClassName, ClassSelector, Selector, TagSelector } from './class-name'

export class DOMElement {
  static BODY = new DOMElement(document.body)
  static DOCUMENT = new DOMElement(document.documentElement)

  get id() {
    return this.element.id
  }

  get parentElement(): DOMElement | null {
    const parentElement = this.element.parentElement
    return parentElement ? new DOMElement(parentElement) : null
  }

  get children(): DOMElement[] {
    return [ ...this.element.children ].map(e => new DOMElement(e as HTMLElement))
  }

  get innerHTML(): string {
    return this.element.innerHTML
  }

  get offsetHeight(): number {
    return this.element.offsetHeight
  }

  get offsetWidth(): number {
    return this.element.offsetWidth
  }

  private get inputElement() {
    failFast.unlessInstanceOf(HTMLInputElement)(this.element, 'element')
    return this.element as HTMLInputElement
  }

  get inputElementValue(): string {
    return this.inputElement.value
  }

  constructor(private readonly element: HTMLElement) { }

  static fromHTML(html: string) {
    const tempElement = document.createElement('div')
    tempElement.innerHTML = html

    failFast.unless(tempElement.children.length === 1, 'HTML must result in exactly one element')
    return new DOMElement(tempElement.firstChild as HTMLElement)
  }

  static single(selector: Selector, rootElement?: DOMElement) {
    if (!('id' in selector)) return DOMElement.all(selector, rootElement)[0]

    const element = document.getElementById(selector.id)
    return element && new DOMElement(element)
  }

  decendants(selector: ClassSelector | TagSelector) {
    return DOMElement.all(selector, this)
  }

  static all(selector: ClassSelector | TagSelector, rootElement?: DOMElement) {
    const root = (rootElement ?? DOMElement.DOCUMENT).element
    const elements = 'className' in selector
      ? root.getElementsByClassName(selector.className.name)
      : root.getElementsByTagName(selector.tagName)
    return [ ...elements ].map(e => new DOMElement(e as HTMLElement))
  }

  setHeight(height: number) {
    this.element.style.height = `${height}px`
  }

  setInputElementValue(value: string) {
    this.inputElement.value = value
  }

  setInnerHTML(html: string) {
    this.element.innerHTML = html
  }

  addClass(className: ClassName) {
    if (this.hasClass(className)) return
    this.element.className = `${this.element.className} ${className.name}`.trim()
  }

  removeClass(className: ClassName) {
    const priorList = this.element.className.split(' ')
    const newList = priorList.filter(s => s !== className.name)
    this.element.className = newList.join(' ')
  }

  toggleClass(className: ClassName) {
    if (this.hasClass(className))
      this.removeClass(className)
    else
      this.addClass(className)
  }

  hasClass(className: ClassName) {
    const list = this.element.className.split(' ')
    return list.indexOf(className.name) >= 0
  }

  add(element: DOMElement) {
    this.element.appendChild(element.element)
  }

  equals(other: DOMElement) {
    return other.element === this.element
  }
}
