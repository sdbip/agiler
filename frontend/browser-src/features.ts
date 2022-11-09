import { render } from './Templates'

(async () => {
  const pageContainer = document.getElementById('page-container')
  if (!pageContainer) throw Error('page container not found')
  pageContainer.innerHTML = await render('feature-page-component', {})
})()
