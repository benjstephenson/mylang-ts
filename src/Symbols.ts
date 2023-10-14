import { ElementOf } from "./types.ts"

export const Symbols = {
  OpenParen: "(" as const,
  CloseParen: ")" as const,
  Equals: "=" as const,
  Plus: "+" as const,
  Minus: "-" as const,
  Asterisk: "*" as const,
  Modulus: "%" as const,
  Caret: "^" as const,
  BackSlash: "\\" as const,
  Slash: "/" as const,
}

const InfixOperators = [Symbols.Plus, Symbols.Minus, Symbols.Asterisk, Symbols.Modulus, Symbols.Slash, Symbols.Caret] as const;
export type InfixOperator = ElementOf<typeof InfixOperators>
export const isInfixOperator = (c: string): c is InfixOperator => InfixOperators.includes(c as any)


