import { InfixOperator } from "../Symbols.ts"

type ElementOf<T extends readonly unknown[]> = T extends readonly (infer ET)[] ? ET : never;

export type NumberToken = { _tag: "Number", value: string }
export const NumberToken = (value: string): NumberToken => ({ _tag: "Number", value })

export type IdentifierToken = { _tag: "Identifier", value: string }
export const IdentifierToken = (value: string): IdentifierToken => ({ _tag: "Identifier", value })

export type LetToken = { _tag: "Let" }
export const LetToken: LetToken = { _tag: "Let" }

export type EqualsToken = { _tag: "Equals" }
export const EqualsToken: EqualsToken = { _tag: "Equals" }

export type OpenParenToken = { _tag: "OpenParen" }
export const OpenParenToken: OpenParenToken = { _tag: "OpenParen" }

export type CloseParenToken = { _tag: "CloseParen" }
export const CloseParenToken: CloseParenToken = { _tag: "CloseParen" }

export type InfixOperatorToken = { _tag: "InfixOperator", value: InfixOperator }
export const InfixOperatorToken = (value: InfixOperator): InfixOperatorToken => ({ _tag: "InfixOperator", value })

export const isInfixOperatorToken = (t: any): t is InfixOperatorToken => t !== undefined && t !== null && t._tag === 'InfixOperator'

export type EofToken = { _tag: "Eof" }
export const EofToken: EofToken = { _tag: "Eof" }

export type Token = NumberToken | IdentifierToken | LetToken | EqualsToken | OpenParenToken | CloseParenToken | InfixOperatorToken | EofToken

export type TokenType = Token["_tag"]

