import globals from '../globals'
import { render } from '../templates'
import { UIEventArgs } from '../index/ui-event-args'
import { DOMElement } from '../dom-element'
import { Popup } from './popup'

(async () => {
  const pageContainer = DOMElement.single({ id: 'page-container' })
  if (!pageContainer) throw Error('page container not found')
  pageContainer.setInnerHTML(await render('features/page-component', {}))

  const helpElements = DOMElement.all({ className: { name: 'hover-help' } })
  for (const helpElement of helpElements) {
    helpElement.on('mouseover', async event => {
      globals.emitUIEvent('help-mouseover', { event, element: event.eventData.target })
    })

    helpElement.on('mouseout', async event => {
      globals.emitUIEvent('help-mouseout', { event, element: event.eventData.target })
    })
  }
})()

globals.emitUIEvent = async (name: string, args: UIEventArgs) => {
  switch (name) {
    case 'help-mouseover': {
      const popup = await Popup.forSnippet(args.element.dataset.snippet)
      popup.showNear(new DOMElement(args.element))
      break
    }
    case 'help-mouseout': {
      const popup = await Popup.forSnippet(args.element.dataset.snippet)
      popup?.hide()
      break
    }
  }
}
