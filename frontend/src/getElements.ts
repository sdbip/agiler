import $ from 'jquery'

export const getElement = (selector: string): HTMLElement | null => $(selector)[0]
export const getElements = (selector: string, rootNode?: Element): Element[] => [ ... $(selector, rootNode) ]
