import { InfixOperator } from "../Symbols"
import { Location } from "../types"

const notUndefinedOrNull = (t: any): boolean => t !== undefined && t !== null
const is = <T extends Token>(tag: T["_tag"]) => (t: any): t is T => notUndefinedOrNull(t) && t._tag === tag

const symbolLocation = (start: number): Location => Location(start, start)

export type NumberToken = { _tag: "Number", value: string, loc: Location }
export const NumberToken = (value: string, loc: Location): NumberToken => ({ _tag: "Number", value, loc })

export type IdentifierToken = { _tag: "Identifier", value: string, loc: Location }
export const IdentifierToken = (value: string, start: number): IdentifierToken => ({ _tag: "Identifier", value, loc: Location(start, start + value.length - 1) })
export const isIdentifierToken = is<IdentifierToken>("Identifier")

export type LetToken = { _tag: "Let", loc: Location }
export const LetToken = (start: number): LetToken => ({ _tag: "Let", loc: Location(start, start + 2) })
export const isLetToken = is<LetToken>("Let")

export type EqualsToken = { _tag: "Equals", loc: Location }
export const EqualsToken = (start: number): EqualsToken => ({ _tag: "Equals", loc: symbolLocation(start) })
export const isEqualsToken = is<EqualsToken>("Equals")

export type OpenParenToken = { _tag: "OpenParen", loc: Location }
export const OpenParenToken = (start: number): OpenParenToken => ({ _tag: "OpenParen", loc: symbolLocation(start) })

export type CloseParenToken = { _tag: "CloseParen", loc: Location }
export const CloseParenToken = (start: number): CloseParenToken => ({ _tag: "CloseParen", loc: symbolLocation(start) })

export type InfixOperatorToken = { _tag: "InfixOperator", value: InfixOperator, loc: Location }
export const InfixOperatorToken = (value: InfixOperator) => (start: number): InfixOperatorToken => ({ _tag: "InfixOperator", value, loc: symbolLocation(start) })

export const isInfixOperatorToken = is<InfixOperatorToken>("InfixOperator")

export type CommaToken = { _tag: "Comma", loc: Location }
export const CommaToken = (start: number): CommaToken => ({ _tag: "Comma", loc: symbolLocation(start) })

export type ColonToken = { _tag: "Colon", loc: Location }
export const ColonToken = (start: number): ColonToken => ({ _tag: "Colon", loc: symbolLocation(start) })
export const isColonToken = is<ColonToken>("Colon")

export type SemiColonToken = { _tag: "SemiColon", loc: Location }
export const SemiColonToken = (start: number): SemiColonToken => ({ _tag: "SemiColon", loc: symbolLocation(start) })

export type OpenBraceToken = { _tag: "OpenBrace", loc: Location }
export const OpenBraceToken = (start: number): OpenBraceToken => ({ _tag: "OpenBrace", loc: symbolLocation(start) })
export const isOpenBraceToken = is<OpenBraceToken>("OpenBrace")

export type CloseBraceToken = { _tag: "CloseBrace", loc: Location }
export const CloseBraceToken = (start: number): CloseBraceToken => ({ _tag: "CloseBrace", loc: symbolLocation(start) })
export const isCloseBraceToken = is<CloseBraceToken>("CloseBrace")

export type EofToken = { _tag: "Eof" }
export const EofToken: EofToken = { _tag: "Eof" }
export const isEofToken = is<EofToken>(EofToken._tag)


type SymbolToken = EqualsToken | OpenParenToken | CloseParenToken | OpenBraceToken |
  CloseBraceToken | CommaToken | ColonToken | SemiColonToken | InfixOperatorToken

export type Token = NumberToken | IdentifierToken | LetToken | SymbolToken | EofToken

export type TokenType = Token["_tag"]

