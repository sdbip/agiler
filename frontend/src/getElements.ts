import $ from 'jquery'

export const getElement = (selector: string, rootNode?: Element): HTMLElement | null => $(selector, rootNode)[0]
export const getElements = (selector: string, rootNode?: Element): Element[] => [ ... $(selector, rootNode) ]
