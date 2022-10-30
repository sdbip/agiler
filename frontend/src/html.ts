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
}
