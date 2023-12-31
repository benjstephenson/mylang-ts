import { pipe } from "../functions"
import { False, NativeFn, NumericVal, RuntimeVal, True, UnitVal } from "./values"

export type Environment = {
  parent: Environment | undefined
  variables: Map<string, RuntimeVal>
}

export function createGlobalEnv() {
  const [_, env] = pipe(
    Environment(),
    declare("x", NumericVal(100)),
    map(declare("True", True)),
    map(declare("False", False)),
    map(declare("print", NativeFn((args, _scope) => {
      console.log(...args)
      return UnitVal
    })))
  )

  return env
}

export const Environment = (parent?: Environment): Environment => ({ parent, variables: new Map<string, RuntimeVal>() })

export const map = (f: (env: Environment) => [RuntimeVal, Environment]) => (last: [RuntimeVal, Environment]) =>
  f(last[1])

export const declare = (name: string, value: RuntimeVal) => (self: Environment): [RuntimeVal, Environment] => {
  if (self.variables.has(name)) { throw new Error(`Cannot redeclare variable ${name}`) }

  return [value, { parent: self.parent, variables: self.variables.set(name, value) }]
}

export const resolve = (name: string) => (self: Environment): Environment => {
  if (self.variables.has(name))
    return self
  else if (self.parent !== undefined)
    return resolve(name)(self.parent)
  else throw new Error(`Variable ${name} is not in scope`)
}

export const lookup = (name: string) => (self: Environment): RuntimeVal =>
  resolve(name)(self).variables.get(name)!
