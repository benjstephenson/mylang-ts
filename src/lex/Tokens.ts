import { InfixOperator } from "../Symbols.ts"

const notUndefinedOrNull = (t: any): boolean => t !== undefined && t !== null
const is = <T extends Token>(tag: T["_tag"]) => (t: any): t is T => notUndefinedOrNull(t) && t._tag === tag

export type NumberToken = { _tag: "Number", value: string }
export const NumberToken = (value: string): NumberToken => ({ _tag: "Number", value })

export type IdentifierToken = { _tag: "Identifier", value: string }
export const IdentifierToken = (value: string): IdentifierToken => ({ _tag: "Identifier", value })
export const isIdentifierToken = is<IdentifierToken>("Identifier")

export type LetToken = { _tag: "Let" }
export const LetToken: LetToken = { _tag: "Let" }
export const isLetToken = is<LetToken>(LetToken._tag)

export type EqualsToken = { _tag: "Equals" }
export const EqualsToken: EqualsToken = { _tag: "Equals" }
export const isEqualsToken = is<EqualsToken>(EqualsToken._tag)

export type OpenParenToken = { _tag: "OpenParen" }
export const OpenParenToken: OpenParenToken = { _tag: "OpenParen" }

export type CloseParenToken = { _tag: "CloseParen" }
export const CloseParenToken: CloseParenToken = { _tag: "CloseParen" }

export type InfixOperatorToken = { _tag: "InfixOperator", value: InfixOperator }
export const InfixOperatorToken = (value: InfixOperator): InfixOperatorToken => ({ _tag: "InfixOperator", value })

export const isInfixOperatorToken = is<InfixOperatorToken>("InfixOperator")

export type CommaToken = { _tag: "Comma" }
export const CommaToken: CommaToken = ({ _tag: "Comma" })

export type ColonToken = { _tag: "Colon" }
export const ColonToken: ColonToken = ({ _tag: "Colon" })
export const isColonToken = is<ColonToken>(ColonToken._tag)

export type SemiColonToken = { _tag: "SemiColon" }
export const SemiColonToken: SemiColonToken = ({ _tag: "SemiColon" })

export type OpenBraceToken = { _tag: "OpenBrace" }
export const OpenBraceToken: OpenBraceToken = ({ _tag: "OpenBrace" })
export const isOpenBraceToken = is<OpenBraceToken>(OpenBraceToken._tag)

export type CloseBraceToken = { _tag: "CloseBrace" }
export const CloseBraceToken: CloseBraceToken = ({ _tag: "CloseBrace" })
export const isCloseBraceToken = is<CloseBraceToken>(CloseBraceToken._tag)

export type EofToken = { _tag: "Eof" }
export const EofToken: EofToken = { _tag: "Eof" }
export const isEofToken = is<EofToken>(EofToken._tag)

export type Token = NumberToken | IdentifierToken | LetToken | EqualsToken | OpenParenToken | CloseParenToken | OpenBraceToken |
  CloseBraceToken | CommaToken | ColonToken | SemiColonToken | InfixOperatorToken | EofToken

export type TokenType = Token["_tag"]

