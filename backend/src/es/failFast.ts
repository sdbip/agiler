const requireCondition = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message)
}

const requireValueSet = (argument: any, name: string) => {
  requireCondition(argument !== null && argument !== undefined, `${name} must be set`)
}

const requireValueSetWithType = (aType: string) => (argument: any, name: string) => {
  requireValueSet(argument, name)
  requireCondition(typeof argument === aType.split(' ')[1], `${name} must be ${aType}`)
}

const requireNumber = (argument: any, name: string) => {
  requireValueSetWithType('a number')(argument, name)
}

const requireString = (argument: any, name: string) => {
  requireValueSetWithType('a string')(argument, name)
}

const requireObject = (argument: any, name: string) => {
  requireValueSetWithType('an object')(argument, name)
}

const requireArrayOf = (type: any, { argument, name }:{argument:any, name:string}) => {
  requireValueSet(argument, name)
  requireCondition(argument instanceof Array, `argument ${name} must be an array`)
  requireCondition(
    argument.every((e: any) => e instanceof type),
    `argument ${name} must only contain elements of type ${type}`)
}

export const failFast = {
  unless: requireCondition,
  unlessNumber: requireNumber,
  unlessString: requireString,
  unlessObject: requireObject,
  unlessArrayOf: (type: any) => (argument: any, name: string) => requireArrayOf(type, { argument, name }),
}
