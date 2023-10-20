import { InfixOperator } from "../Symbols.ts"

export type Program = {
  _tag: "Program"
  body: Expr[]
}
export const Program = (body: Expr[] = []): Program => ({ _tag: "Program", body })

export type LetDeclaration = {
  _tag: "LetDeclaration",
  identifier: string,
  value: Expr
}
export const LetDeclaration = (identifier: string, value: Expr): LetDeclaration => ({ _tag: "LetDeclaration", identifier, value })

export type InfixExpr = {
  _tag: "InfixExpr"
  left: Expr
  right: Expr
  operator: InfixOperator
}

export const InfixExpr = (
  left: Expr,
  right: Expr,
  operator: InfixOperator,
): InfixExpr => ({
  _tag: "InfixExpr",
  left,
  right,
  operator,
})

export type Identifier = {
  _tag: "Identifier"
  symbol: string
}

export const Identifier = (symbol: string): Identifier => ({
  _tag: "Identifier",
  symbol,
})

export type NumericLiteral = {
  _tag: "NumericLiteral"
  value: number
}

export const NumericLiteral = (value: number): NumericLiteral => ({
  _tag: "NumericLiteral",
  value,
})

export type Property = {
  _tag: "Property",
  key: string,
  value?: Expr
}

export const Property = (key: string, val: Expr | undefined = undefined): Property =>
  val === undefined
    ? ({ _tag: "Property", key })
    : ({ _tag: "Property", key, value: val })

export type ObjectLiteral = {
  _tag: "ObjectLiteral",
  properties: Property[]
}
export const ObjectLiteral = (properties: Property[]): ObjectLiteral => ({ _tag: "ObjectLiteral", properties })

export type Expr = Program | LetDeclaration | InfixExpr | Identifier | NumericLiteral | Property | ObjectLiteral
export type NodeType = Expr["_tag"]

