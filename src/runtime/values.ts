export type ValueType = "number"


export type NumericVal = {
  _tag: "NumericVal"
  value: number
}

export const NumericVal = (value: number): NumericVal => ({ _tag: "NumericVal", value })
export const isNumericVal = (a: any): a is NumericVal => a && a._tag === "NumericVal"

export type RuntimeVal = NumericVal
