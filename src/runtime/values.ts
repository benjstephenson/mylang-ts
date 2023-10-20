export type ValueType = "number"


export type NumericVal = Readonly<{
  _tag: "NumericVal"
  value: number
}>

export const NumericVal = (value: number): NumericVal => ({ _tag: "NumericVal", value })
export const isNumericVal = (a: any): a is NumericVal => a && a._tag === "NumericVal"

export type BooleanVal = Readonly<{
  _tag: "BooleanVal",
  value: boolean
}>

export const True: BooleanVal = ({ _tag: "BooleanVal", value: true })
export const False: BooleanVal = ({ _tag: "BooleanVal", value: false })

export type RuntimeVal = NumericVal | BooleanVal
