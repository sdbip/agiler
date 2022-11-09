import { marked } from 'marked'
import { render } from './Templates'

(async () => {
  const pageContainer = document.getElementById('page-container')
  if (!pageContainer) throw Error('page container not found')
  pageContainer.innerHTML = await render('feature-page-component', {})

  const hoverElements = document.getElementsByClassName('hover-help')
  for (const element of hoverElements as HTMLCollectionOf<HTMLElement>) {
    element.addEventListener('mouseover', async event => {
      const eventTarget = event.target as HTMLElement
      const snippet = eventTarget.dataset.snippet

      const elementId = `popup:${snippet}`
      const existingPopupElement = document.getElementById(elementId)
      const popupElement = existingPopupElement ?? document.createElement('div')
      if (!existingPopupElement) {
        popupElement.className = 'pop-up'
        popupElement.id = elementId
        document.body.append(popupElement)

        const response = await fetch(`public/popups/${snippet}.md`)
        const html = marked.parse(await response.text())
        popupElement.innerHTML = html
      }

      showPopup(popupElement, eventTarget)
    })

    element.addEventListener('mouseout', async event => {
      const eventTarget = event.target as HTMLElement
      const snippet = eventTarget.dataset.snippet
      const popupElement = document.getElementById(`popup:${snippet}`)
      if (popupElement) hidePopup(popupElement)
    })
  }
})()

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

