export const getElement = (selector: string): HTMLElement | null =>
  document.getElementById(selector.substring(1))

export const getElements = (selector: string, rootNode?: Element): Element[] => {
  const parentNode = rootNode ?? document
  return selector.startsWith('.')
    ? [ ...parentNode.getElementsByClassName(selector.substring(1)) ]
    : [ ...parentNode.getElementsByTagName(selector) ]
}
