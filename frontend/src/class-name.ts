export type ClassName =
  { name: 'disclosed' } |
  { name: 'hidden' } |
  { name: 'inactive' } |
  { name: 'default' }

export const ClassName = {
  default: { name: 'default' } as ClassName,
  disclosed: { name: 'disclosed' } as ClassName,
  hidden: { name: 'hidden' } as ClassName,
  inactive: { name: 'inactive' } as ClassName,
}

type IdSelector = {
  id: string
}

type ClassSelector = {
  className: ClassName
}

type TagSelector = {
  tagName: string
}

export type Selector = ClassSelector | IdSelector | TagSelector

export const selector = (selector: Selector) =>
  'className' in selector
    ? `.${selector.className.name}`
    : 'id' in selector
      ? `#${selector.id}`
      : selector.tagName

export const toSelector = (string: string): Selector => {
  switch (string) {
    case '.default': return { className: ClassName.default }
    case '.disclosed': return { className: ClassName.disclosed }
    case '.hidden': return { className: ClassName.hidden }
    case '.inactive': return { className: ClassName.inactive }
  }

  switch (string.charAt(0)) {
    case '#': return { id: string.substring(1) }
    default: return { tagName: string }
  }
}
