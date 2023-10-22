import { InfixOperator } from "../Symbols"
import { Location } from "../types"

export type Program = {
  _tag: "Program"
  body: Expr[],
  loc: Location
}
export const Program = (start: number, end: number, body: Expr[] = []): Program => ({ _tag: "Program", body, loc: Location(start, end) })

export type LetDeclaration = {
  _tag: "LetDeclaration",
  identifier: string,
  value: Expr,
  loc: Location
}
export const LetDeclaration = (identifier: string, value: Expr, loc: Location): LetDeclaration => ({ _tag: "LetDeclaration", identifier, value, loc })

export type InfixExpr = {
  _tag: "InfixExpr"
  left: Expr
  right: Expr
  operator: InfixOperator,
  loc: Location
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
  loc: Location(
    left.loc.start,
    right.loc.end
  )
})

export type Identifier = {
  _tag: "Identifier"
  symbol: string,
  loc: Location
}

export const Identifier = (symbol: string, loc: Location): Identifier => ({
  _tag: "Identifier",
  symbol,
  loc
})

export type NumericLiteral = {
  _tag: "NumericLiteral"
  value: number,
  loc: Location
}

export const NumericLiteral = (value: number, loc: Location): NumericLiteral => ({
  _tag: "NumericLiteral",
  value,
  loc
})

export type Property = {
  _tag: "Property",
  key: string,
  value?: Expr,
  loc: Location
}

export const Property = (key: string, loc: Location, val: Expr | undefined = undefined): Property =>
  val === undefined
    ? ({ _tag: "Property", key, loc })
    : ({ _tag: "Property", key, value: val, loc })

export type ObjectLiteral = {
  _tag: "ObjectLiteral",
  properties: Property[],
  loc: Location
}
export const ObjectLiteral = (properties: Property[], start: number, end: number): ObjectLiteral => ({ _tag: "ObjectLiteral", properties, loc: Location(start, end) })

export type CallExpr = {
  _tag: "CallExpr",
  args: Expr[],
  caller: Expr,
  loc: Location
}
export const CallExpr = (caller: Expr, args: Expr[], loc: Location): CallExpr => ({ _tag: "CallExpr", args, caller, loc })

export type MemberExpr = {
  _tag: "MemberExpr",
  object: Expr,
  property: Expr,
  computed: "Literal" | "Computed",
  loc: Location
}

export const MemberExpr = (object: Expr, property: Expr, computed: "Literal" | "Computed", loc: Location): MemberExpr =>
  ({ _tag: "MemberExpr", object, property, computed, loc })

export type Expr = Program | LetDeclaration | InfixExpr | Identifier | NumericLiteral | Property | ObjectLiteral | CallExpr | MemberExpr
export type NodeType = Expr["_tag"]

