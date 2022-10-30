export class HTML {
  static BODY = new HTML(document.body)
  static DOCUMENT = new HTML(document.documentElement)

  get id() {
    return this.element.id
  }

  constructor(readonly element: HTMLElement) { }
  static single(selector: string, root?: HTML) {
    if (selector[0] !== '#') return HTML.all(selector, root)[0]

    const element = document.getElementById(selector.substring(1))
    return element && new HTML(element)
  }

  static all(selector: string, root?: HTML) {
    const rootElement = (root ?? HTML.DOCUMENT).element
    const elements = selector[0] === '.'
      ? rootElement.getElementsByClassName(selector.substring(1))
      : rootElement.getElementsByTagName(selector)
    return [ ...elements ].map(e => new HTML(e as HTMLElement))
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
