import { failFast } from '../../shared/src/failFast'

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
  static single(selector: string, rootElement?: DOMElement) {
    if (selector[0] !== '#') return DOMElement.all(selector, rootElement)[0]

    const element = document.getElementById(selector.substring(1))
    return element && new DOMElement(element)
  }

  static all(selector: string, rootElement?: DOMElement) {
    const root = (rootElement ?? DOMElement.DOCUMENT).element
    const elements = selector[0] === '.'
      ? root.getElementsByClassName(selector.substring(1))
      : root.getElementsByTagName(selector)
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

  addClass(className: string) {
    if (this.hasClass(className)) return
    this.element.className = `${this.element.className} ${className}`.trim()
  }

  removeClass(className: string) {
    while (this.hasClass(className)) {
      const index = indexOfClassName(this.element.className, className, 0)
      this.element.className = `${this.element.className.substring(0, index)}${this.element.className.substring(index + className.length)}`.trim()
    }
  }

  toggleClass(className: string) {
    if (this.hasClass(className))
      this.removeClass(className)
    else
      this.addClass(className)
  }

  hasClass(className: string) {
    return indexOfClassName(this.element.className, className, 0) >= 0
  }

  equals(other: DOMElement) {
    return other.element === this.element
  }
}

const indexOfClassName = (s: string, className: string, index: number) => {
  const isGoodStart = () => index === 0 || /\s/.test(s[index - 1])
  const isGoodEnd = () => index + className.length === s.length ||
    /\s/.test(s[index + className.length])

  do {
    index = s.indexOf(className, index)
    if (index < 0) return index
    if (isGoodStart() && isGoodEnd()) return index

    index++
  } while (index >= 0)
  return index
}
