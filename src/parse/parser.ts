import { InfixOperator, Symbols } from "../Symbols"
import { Location, showLoc } from "../types"
import * as A from "../array"
import {
  CloseBracketToken,
  Token,
  TokenType,
  isCloseBraceToken,
  isCloseBracketToken,
  isCloseParenToken,
  isColonToken,
  isDotToken,
  isEofToken,
  isEqualsToken,
  isIdentifierToken,
  isInfixOperatorToken,
  isLetToken,
  isOpenBraceToken,
  isOpenBracketToken,
  isOpenParenToken,
} from "../lex/Tokens"
import { tokenise } from "../lex/lexer"
import {
  CallExpr,
  Expr,
  Identifier,
  InfixExpr,
  LetDeclaration,
  MemberExpr,
  NumericLiteral,
  ObjectLiteral,
  Program,
  Property,
} from "./ast"
import { PrettyPrinter } from "mismatched"

function popExpected(tokenType: TokenType, tokens: Token[]): Token[] {
  const [head, ...tail] = tokens

  if (head && head._tag !== tokenType && !isEofToken(head)) {
    throw new Error(`Expected ${tokenType} at pos ${head.loc.start} but found ${head._tag}`)
  }
  return tail
}

function parsePrimaryExpr(tokens: Token[]): [Token[], Expr] {
  const [token, ...tail] = tokens

  if (token === undefined || isEofToken(token)) throw new Error("Unexpected end of token list")

  switch (token._tag) {
    case "Identifier":
      return [tail, Identifier(token.value, token.loc)]
    case "Number":
      return [tail, NumericLiteral(parseFloat(token.value), token.loc)]

    case "OpenParen": {
      // TODO probably need to pad the Expr loc left and right here to account for the braces
      const [remainingTokens, expr] = parseExpr(tail)
      return [popExpected("CloseParen", remainingTokens), expr]
    }

    default:
      throw new Error(`Unexpected token [${token._tag}] at loc ${showLoc(token.loc)}`)
  }
}

function parseMemberExpr(tokens: Token[]): [Token[], Expr] {
  const [remainingTokens, object] = parsePrimaryExpr(tokens)

  const _parseMemberExpr = (tokens: Token[], expr: Expr): [Token[], Expr] => {
    const [head, ...tail] = tokens
    if (!(isDotToken(head) || isOpenBracketToken(head))) return [tokens, expr]

    if (isDotToken(head)) {
      const [rest, property] = parsePrimaryExpr(tail)
      if (!isIdentifierToken(property)) throw new Error(`Expected identifier in member expression at ${head.loc.end}`)

      return _parseMemberExpr(rest, MemberExpr(expr, property, "Literal", Location(expr.loc.start, property.loc.end)))
    }

    const [[bracket, ...rest], property] = parseExpr(tail)
    if (!isCloseBracketToken(bracket)) throw new Error(`Expected closing bracket in member expression at ${property.loc.end}`)

    return _parseMemberExpr(rest, MemberExpr(expr, property, "Computed", Location(expr.loc.start, property.loc.end)))
  }

  return _parseMemberExpr(remainingTokens, object)
}

function parseArgs(tokens: Token[]): [Token[], Expr[]] {
  const [head, ...tail] = tokens

  // if (!isOpenParenToken(head)) throw new Error(`Expected OpenParen token for argument list ${head === undefined ? "" : `at ${showLoc(head.loc)}`}, but got ${head?._tag}`)

  const _parseArgsList = (toks: Token[], args: Expr[]): [Token[], Expr[]] => {
    const [first, ...tail] = toks

    // if (isEofToken(first) || first === undefined)
    //   throw new Error(`Expected argument list or closing paren`)// after ${showLoc(head.loc)}`)

    if (isCloseParenToken(first)) return [tail, args]

    const [remainingTokens, arg] = parseObjectExpr(toks)
    return _parseArgsList(remainingTokens, A.push(arg, args))
  }

  return _parseArgsList(tokens, [])
}

function parseCallExpr(caller: Expr, tokens: Token[]): [Token[], Expr] {
  const [remainingTokens, args] = parseArgs(tokens)
  const callExpr = CallExpr(caller, args, Location(caller.loc.start, args[args.length - 1]?.loc.end || -1))
  const [head, ...tail] = remainingTokens

  return isOpenParenToken(head)
    ? parseCallExpr(callExpr, tail)
    : [remainingTokens, callExpr]

}

function parseCallMemberExpr(tokens: Token[]): [Token[], Expr] {
  const [remainingTokens, member] = parseMemberExpr(tokens)
  const [head, ...tail] = remainingTokens

  return isOpenParenToken(head)
    ? parseCallExpr(member, tail)
    : [remainingTokens, member]
}

function buildExprParser(
  operators: InfixOperator[],
  parser: (tokens: Token[]) => [Token[], Expr],
): (tokens: Token[]) => [Token[], Expr] {
  const _parse = (tokens: Token[], expr: Expr): [Token[], Expr] => {
    const [head, ...tail] = tokens

    if (!isInfixOperatorToken(head) || !operators.includes(head.value)) {
      return [tokens, expr]
    }

    const operator = head.value
    const [remainingTokens, right] = parser(tail)

    return _parse(
      remainingTokens,
      InfixExpr(expr, right, operator),
    )
  }

  return (tokens: Token[]): [Token[], Expr] => {
    const [remainingTokens, left] = parser(tokens)
    return _parse(remainingTokens, left)
  }
}

const parseExponentialExpr = buildExprParser([Symbols.Caret], parseCallMemberExpr)

const parseMultiplicativeExpr = buildExprParser([
  Symbols.Slash,
  Symbols.Asterisk,
  Symbols.Percent,
], parseExponentialExpr)

const parseAdditiveExpr = buildExprParser(
  [Symbols.Plus, Symbols.Minus],
  parseMultiplicativeExpr,
)

function parseObjectExpr(tokens: Token[]): [Token[], Expr] {
  const [head, ...tail] = tokens

  console.log(head?._tag)
  if (!isOpenBraceToken(head)) return parseAdditiveExpr(tokens)

  const _parseObjectExpr = (tokens: Token[], props: Property[], endLoc: number): [Token[], Property[], number] => {
    const [head, t, ...tail] = tokens

    if (!head || isCloseBraceToken(head) || isEofToken(head)) {
      return [[t!, ...tail], props, endLoc]
    }

    if (!t || isEofToken(t)) {
      throw new Error(`Uneven object literal, ${isIdentifierToken(head)
        ? `${head.value} must have a value`
        : `no named value to assign`
        }`)
    }

    if (isIdentifierToken(head)) {
      const [remainingTokens, expr] = parseExpr([t, ...tail])
      return _parseObjectExpr(
        remainingTokens,
        A.push(Property(head.value, Location(head.loc.start, expr.loc.end), expr), props),
        expr.loc.end
      )
    }

    if (isColonToken(head)) {
      if (isIdentifierToken(t)) {
        return _parseObjectExpr(
          tail,
          A.push(Property(t.value, Location(head.loc.start, t.loc.end)), props),
          t.loc.end
        )
      }

      throw new Error(
        `Cannot assign a ${t._tag} expression to a naked identifier in object literal at pos ${t.loc.start}`,
      )
    }

    throw new Error(`Invalid identifier ${head._tag} in object literal at los ${showLoc(head.loc)}`)
  }

  const [remainingTokens, properties, end] = _parseObjectExpr(tail, [], 0)
  return [remainingTokens, ObjectLiteral(properties, head.loc.start, end)]
}

function parseLetDeclaration(tokens: Token[], start: number): [Token[], Expr] {
  const [head, eq, ...tail] = tokens

  if (!isIdentifierToken(head)) return parseExpr(tokens)
  if (!isEqualsToken(eq) && !isEofToken(eq))
    throw new Error(`Expected Equals symbol ${eq !== undefined ? `at pos ${showLoc(eq.loc)} ` : `after ${head.loc.end}`}, but found ${eq?._tag}`)

  const [remainingTokens, value] = parseExpr(tail)
  return [remainingTokens, LetDeclaration(head.value, value, Location(start, value.loc.end))]
}

function parseExpr(tokens: Token[]): [Token[], Expr] {
  // return parseAdditiveExpr(tokens)
  return parseObjectExpr(tokens)
}

function parseStatement(tokens: A.NonEmptyArray<Token>): [Token[], Expr] {
  const [head, ...tail] = tokens

  if (isLetToken(head)) return parseLetDeclaration(tail, head.loc.start)

  return parseExpr(tokens)
}


// Order of operations
// Declaration
// Object
// AdditiveExpr
// MultiplicitaveExpr
// Call
// Member
// PrimaryExpr
export function produceAST(raw: string[]): Program {
  const _produceAST = (tokens: Token[], exprs: Expr[], start: number, end: number): [number, number, Expr[]] => {
    if (!A.isNonEmpty(tokens)) return [start, end, exprs]

    const t = A.head(tokens)

    if (isEofToken(t)) return [start, end, exprs]

    const [remainingTokens, es] = parseStatement(tokens)
    return _produceAST(remainingTokens, A.push(es, exprs), start, es.loc.end)
  }

  const tokens = raw.flatMap(tokenise)

  const [start, end, body] = _produceAST(tokens, [], 0, 0)
  return Program(start, end, body)
}
