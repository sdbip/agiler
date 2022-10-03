export const addClass = (element: Element, className: string) => {
  if (hasClass(element, className)) return
  element.className = `${element.className} ${className}`
}

export const removeClass = (element: Element, className: string) => {
  while (hasClass(element, className)) {
    const index = indexOfClassName(element.className, className, 0)
    element.className = `${element.className.substring(0, index)}${element.className.substring(index + className.length)}`
  }
}

export const hasClass = (element: Element, className: string) =>
  indexOfClassName(element.className, className, 0) >= 0

const indexOfClassName = (s: string, className: string, index: number) => {
  const isGoodStart = () => index === 0 || /\s/.test(s[index - 1])
  const isGoodEnd = () => index + className.length === s.length ||
    /\s/.test(s[index + className.length])

  do {
    index = s.indexOf(className, index)
    if (index < 0) return index
    if (isGoodStart() && isGoodEnd()) return index

    index++
  } while(index >= 0)
  return index
}
