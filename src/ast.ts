export type NodeType =
  | "Program"
  | "NumericLiteral"
  | "Identifier"
  | "InfixExpr";

export type Program = {
  kind: "Program";
  body: Expr[];
};

export type InfixExpr = {
  kind: "InfixExpr";
  left: Expr;
  right: Expr;
  operator: "+" | "-" | "*" | "/" | "%" | "^";
};

export const InfixExpr = (
  left: Expr,
  right: Expr,
  operator: string,
): InfixExpr => ({
  kind: "InfixExpr",
  left,
  right,
  operator,
});

export type Identifier = {
  kind: "Identifier";
  symbol: string;
};

export const Identifier = (symbol: string): Identifier => ({
  kind: "Identifier",
  symbol,
});

export type NumericLiteral = {
  kind: "NumericLiteral";
  value: number;
};

export const NumericLiteral = (value: number): NumericLiteral => ({
  kind: "NumericLiteral",
  value,
});

export type Expr = Program | InfixExpr | Identifier | NumericLiteral;
