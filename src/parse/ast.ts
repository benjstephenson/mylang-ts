import { InfixOperator } from "../Symbols.ts";

export type Program = {
  _tag: "Program";
  body: Expr[];
};
export const Program = (body: Expr[] = []): Program => ({ _tag: "Program", body })

export type InfixExpr = {
  _tag: "InfixExpr";
  left: Expr;
  right: Expr;
  operator: InfixOperator
};

export const InfixExpr = (
  left: Expr,
  right: Expr,
  operator: InfixOperator,
): InfixExpr => ({
  _tag: "InfixExpr",
  left,
  right,
  operator,
});

export type Identifier = {
  _tag: "Identifier";
  symbol: string;
};

export const Identifier = (symbol: string): Identifier => ({
  _tag: "Identifier",
  symbol,
});

export type NumericLiteral = {
  _tag: "NumericLiteral";
  value: number;
};

export const NumericLiteral = (value: number): NumericLiteral => ({
  _tag: "NumericLiteral",
  value,
});

export type Expr = Program | InfixExpr | Identifier | NumericLiteral;
export type NodeType = Expr["_tag"]

