import globals from './globals'
import { marked } from 'marked'
import { render } from './Templates'
import { UIEventArgs } from './ui-event-args'
import { DOMElement } from './dom-element'

(async () => {
  const pageContainer = DOMElement.single({ id: 'page-container' })
  if (!pageContainer) throw Error('page container not found')
  pageContainer.setInnerHTML(await render('feature-page-component', {}))

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
      const popup = await getOrCreatePopup(args.element.dataset.snippet)
      showPopup(popup, args.element)
      break
    }
    case 'help-mouseout': {
      const popup = document.getElementById(`popup:${args.element.dataset.snippet}`)
      if (popup) hidePopup(popup)
      break
    }
  }
}

async function getOrCreatePopup(snippet: string | undefined) {
  const existingPopupElement = document.getElementById(`popup:${snippet}`)
  const popupElement = existingPopupElement ?? document.createElement('div')
  if (!existingPopupElement) {
    popupElement.className = 'pop-up'
    popupElement.id = `popup:${snippet}`
    document.body.append(popupElement)

    const response = await fetch(`public/popups/${snippet}.md`)
    popupElement.innerHTML = marked.parse(await response.text())
  }
  return popupElement
}

function showPopup(popup: HTMLElement, targetElement: HTMLElement) {
  const targetBox = targetElement.getBoundingClientRect()
  const position = {
    x: targetBox.left + 10,
    y: targetBox.top + targetBox.height + 10,
  }

  const style = popup.style
  style.display = 'revert'

  const popupBox = popup.getBoundingClientRect()
  const maxWidth = document.documentElement.clientWidth
  if (position.x + popupBox.width + 10 > maxWidth)
    position.x = maxWidth - (popupBox.width + 10)

  style.top = `${position.y}px`
  style.left = `${position.x}px`
}

function hidePopup(popup: HTMLElement) {
  popup.style.display = ''
}
