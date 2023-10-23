import { Expr } from "../parse/ast"
import * as Env from "./environment"

export type ValueType = "number"

const is = <T extends RuntimeVal>(tag: T["_tag"]) => (t: any): t is T => t && t._tag === tag

export type UnitVal = Readonly<{
  _tag: "UnitVal"
}>
export const UnitVal: UnitVal = ({ _tag: "UnitVal" })
export const isUnit = is<UnitVal>("UnitVal")

export type NumericVal = Readonly<{
  _tag: "NumericVal"
  value: number
}>

export const NumericVal = (value: number): NumericVal => ({ _tag: "NumericVal", value })
export const isNumericVal = is<NumericVal>("NumericVal")

export type BooleanVal = Readonly<{
  _tag: "BooleanVal",
  value: boolean
}>

export const True: BooleanVal = ({ _tag: "BooleanVal", value: true })
export const False: BooleanVal = ({ _tag: "BooleanVal", value: false })

export type ObjectVal = Readonly<{
  _tag: "ObjectVal",
  properties: Map<string, RuntimeVal>
}>
export const ObjectVal = (properties: [string, RuntimeVal][]): ObjectVal => ({ _tag: "ObjectVal", properties: new Map(properties) })

export type FunctionCall = (args: RuntimeVal[], env: Env.Environment) => RuntimeVal

export type NativeFn = Readonly<{
  _tag: "NativeFn",
  call: FunctionCall
}>

export const NativeFn = (call: FunctionCall): NativeFn => ({ _tag: "NativeFn", call })
export const isNativeFn = is<NativeFn>("NativeFn")

export type Fun = Readonly<{
  _tag: "Fun",
  name: string,
  parameters: string[],
  declarationEnv: Env.Environment,
  body: Expr[]
}>

export const Fun = (name: string, parameters: string[], declarationEnv: Env.Environment, body: Expr[]): Fun => ({ _tag: "Fun", name, parameters, declarationEnv, body })
export const isFun = is<Fun>("Fun")



export type RuntimeVal = UnitVal | NumericVal | BooleanVal | ObjectVal | NativeFn | Fun
