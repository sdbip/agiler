import { ClassName } from './class-name'
import { DOMElement } from './dom-element'

export class MeasureComponent {
  static readonly instance = new MeasureComponent()
  readonly element: DOMElement

  private constructor() {
    DOMElement.BODY.add(DOMElement.fromHTML('<div class="measure"><div id="measure"></div></div>'))
    this.element = DOMElement.single({ id: 'measure' }) as DOMElement
  }

  measure(html: string) {
    this.element.setInnerHTML(html)
    for (const element of this.element.decendants({ className: ClassName.hidden }))
      element.removeClass(ClassName.hidden)
    return {
      height: this.element.offsetHeight,
      width: this.element.offsetWidth,
    }
  }
}
