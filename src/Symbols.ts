import { CloseBraceToken, CloseParenToken, ColonToken, EqualsToken, InfixOperatorToken, OpenBraceToken, OpenParenToken, SemiColonToken, Token } from "./lex/Tokens";
import { ElementOf, PropertyOf } from "./types"

export const Symbols = {
  OpenParen: "(" as const,
  CloseParen: ")" as const,
  OpenBrace: "{" as const,
  CloseBrace: "}" as const,
  Equals: "=" as const,
  Plus: "+" as const,
  Minus: "-" as const,
  Asterisk: "*" as const,
  Percent: "%" as const,
  Caret: "^" as const,
  // BackSlash: "\\" as const,
  Slash: "/" as const,
  Colon: ":" as const,
  SemiColon: ";" as const,
  // Ampersand: "&" as const,
  // Pipe: "|" as const,
  // Bang: "!" as const
} as const

export const SymbolToToken: Record<KnownSymbol, (start: number) => Token> = {
  [Symbols.OpenParen]: OpenParenToken,
  [Symbols.CloseParen]: CloseParenToken,
  [Symbols.OpenBrace]: OpenBraceToken,
  [Symbols.CloseBrace]: CloseBraceToken,
  [Symbols.Equals]: EqualsToken,
  [Symbols.Plus]: InfixOperatorToken("+"),
  [Symbols.Minus]: InfixOperatorToken("-"),
  [Symbols.Asterisk]: InfixOperatorToken("*"),
  [Symbols.Percent]: InfixOperatorToken("%"),
  [Symbols.Caret]: InfixOperatorToken("^"),
  // [Symbols.BackSlash]: BackSlash
  [Symbols.Slash]: InfixOperatorToken("/"),
  [Symbols.Colon]: ColonToken,
  [Symbols.SemiColon]: SemiColonToken,
  // [Symbols.Ampersand]: "&" as const,
  // [Symbols.Pipe]: "|" as const,
  // [Symbols.Bang]: "!" as const
}


export type KnownSymbol = PropertyOf<typeof Symbols>
const knownSymbols = Object.entries(Symbols).map(x => x[1])
export const isKnownSymbol = (c: string): c is KnownSymbol => knownSymbols.includes(c as any)

const InfixOperators = [Symbols.Plus, Symbols.Minus, Symbols.Asterisk, Symbols.Percent, Symbols.Slash, Symbols.Caret] as const;
export type InfixOperator = ElementOf<typeof InfixOperators>
export const isInfixOperator = (c: string): c is InfixOperator => InfixOperators.includes(c as any)

// const BooleanOperators = [`${Symbols.Ampersand}${Symbols.Ampersand}`, `${Symbols.Pipe}${Symbols.Pipe}`] as const
// export type BooleanOperator = ElementOf<typeof BooleanOperators>
// export const isBooleanOperator = (c: string): c is BooleanOperator => BooleanOperators.includes(c as any)
