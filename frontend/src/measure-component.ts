import { DOMElement } from './dom-element'

export class MeasureComponent {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  static readonly instance = new MeasureComponent(DOMElement.single('#measure')!)
  private constructor(readonly element: DOMElement) { }

  measure(html: string) {
    this.element.setInnerHTML(html)
    for (const element of DOMElement.all('.hidden', this.element))
      element.removeClass('hidden')
    return {
      height: this.element.offsetHeight,
      width: this.element.offsetWidth,
    }
  }
}
