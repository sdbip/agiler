import Mustache from 'mustache'

export async function render(templateURL: URL, viewModel: object) {
  const template = await loadFile(templateURL)
  return Mustache.render(template, viewModel)
}

async function loadFile(url: URL) {
  const response = await fetch(url)
  return await response.text()
}
