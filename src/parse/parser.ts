import { InfixOperator, Symbols } from "../Symbols"
import { Location, showLoc } from "../types"
import * as A from "../array"
import {
  CloseBracketToken,
  IdentifierToken,
  Token,
  TokenType,
  isCloseBraceToken,
  isCloseBracketToken,
  isCloseParenToken,
  isColonToken,
  isDotToken,
  isEofToken,
  isEqualsToken,
  isFunToken,
  isIdentifierToken,
  isInfixOperatorToken,
  isLetToken,
  isOpenBraceToken,
  isOpenBracketToken,
  isOpenParenToken,
} from "../lex/Tokens"
import { tokenise } from "../lex/lexer"
import * as AST from "./ast"
import { PrettyPrinter } from "mismatched"

function popExpected(tokenType: TokenType, tokens: Token[]): Token[] {
  const [head, ...tail] = tokens

  if (head && head._tag !== tokenType && !isEofToken(head)) {
    throw new Error(`Expected ${tokenType} at pos ${head.loc.start} but found ${head._tag}`)
  }
  return tail
}

function parsePrimaryExpr(tokens: Token[]): [Token[], AST.Expr] {
  const [token, ...tail] = tokens

  if (token === undefined || isEofToken(token)) throw new Error("Unexpected end of token list")

  switch (token._tag) {
    case "Identifier":
      return [tail, AST.Identifier(token.value, token.loc)]
    case "Number":
      return [tail, AST.NumericLiteral(parseFloat(token.value), token.loc)]

    case "String":
      return [tail, AST.StringLiteral(token.value, token.loc)]

    case "OpenParen": {
      // TODO probably need to pad the Expr loc left and right here to account for the braces
      const [remainingTokens, expr] = parseExpr(tail)
      return [popExpected("CloseParen", remainingTokens), expr]
    }

    default:
      throw new Error(`Unexpected token [${token._tag}] at loc ${showLoc(token.loc)}`)
  }
}

function parseMemberExpr(tokens: Token[]): [Token[], AST.Expr] {
  const [remainingTokens, object] = parsePrimaryExpr(tokens)

  const _parseMemberExpr = (tokens: Token[], expr: AST.Expr): [Token[], AST.Expr] => {
    const [head, ...tail] = tokens
    if (!(isDotToken(head) || isOpenBracketToken(head))) return [tokens, expr]

    if (isDotToken(head)) {
      const [rest, property] = parsePrimaryExpr(tail)
      if (!isIdentifierToken(property)) throw new Error(`Expected identifier in member expression at ${head.loc.end}`)

      return _parseMemberExpr(rest, AST.MemberExpr(expr, property, "Literal", Location(expr.loc.start, property.loc.end)))
    }

    const [[bracket, ...rest], property] = parseExpr(tail)
    if (!isCloseBracketToken(bracket)) throw new Error(`Expected closing bracket in member expression at ${property.loc.end}`)

    return _parseMemberExpr(rest, AST.MemberExpr(expr, property, "Computed", Location(expr.loc.start, property.loc.end)))
  }

  return _parseMemberExpr(remainingTokens, object)
}

function parseArgs(tokens: Token[]): [Token[], AST.Expr[]] {
  const _parseArgsList = (toks: Token[], args: AST.Expr[]): [Token[], AST.Expr[]] => {
    const [first, ...tail] = toks

    if (isCloseParenToken(first)) return [tail, args]

    const [remainingTokens, arg] = parseObjectExpr(toks)
    return _parseArgsList(remainingTokens, A.push(arg, args))
  }

  return _parseArgsList(tokens, [])
}

function parseCallExpr(caller: AST.Expr, tokens: Token[]): [Token[], AST.Expr] {
  const [remainingTokens, args] = parseArgs(tokens)
  const callExpr = AST.CallExpr(caller, args, Location(caller.loc.start, args[args.length - 1]?.loc.end || -1))
  const [head, ...tail] = remainingTokens

  return isOpenParenToken(head)
    ? parseCallExpr(callExpr, tail)
    : [remainingTokens, callExpr]

}

function parseCallMemberExpr(tokens: Token[]): [Token[], AST.Expr] {
  const [remainingTokens, member] = parseMemberExpr(tokens)
  const [head, ...tail] = remainingTokens

  return isOpenParenToken(head)
    ? parseCallExpr(member, tail)
    : [remainingTokens, member]
}

function buildExprParser(
  operators: InfixOperator[],
  parser: (tokens: Token[]) => [Token[], AST.Expr],
): (tokens: Token[]) => [Token[], AST.Expr] {
  const _parse = (tokens: Token[], expr: AST.Expr): [Token[], AST.Expr] => {
    const [head, ...tail] = tokens

    if (!isInfixOperatorToken(head) || !operators.includes(head.value)) {
      return [tokens, expr]
    }

    const operator = head.value
    const [remainingTokens, right] = parser(tail)

    return _parse(
      remainingTokens,
      AST.InfixExpr(expr, right, operator),
    )
  }

  return (tokens: Token[]): [Token[], AST.Expr] => {
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

function parseObjectExpr(tokens: Token[]): [Token[], AST.Expr] {
  const [head, ...tail] = tokens

  if (!isOpenBraceToken(head)) return parseAdditiveExpr(tokens)

  const _parseObjectExpr = (tokens: Token[], props: AST.Property[], endLoc: number): [Token[], AST.Property[], number] => {
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
        A.push(AST.Property(head.value, Location(head.loc.start, expr.loc.end), expr), props),
        expr.loc.end
      )
    }

    if (isColonToken(head)) {
      if (isIdentifierToken(t)) {
        return _parseObjectExpr(
          tail,
          A.push(AST.Property(t.value, Location(head.loc.start, t.loc.end)), props),
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
  return [remainingTokens, AST.ObjectLiteral(properties, head.loc.start, end)]
}

function parseLetDeclaration(tokens: Token[], start: number): [Token[], AST.Expr] {
  const [head, eq, ...tail] = tokens

  if (!isIdentifierToken(head)) return parseExpr(tokens)
  if (!isEqualsToken(eq) && !isEofToken(eq))
    throw new Error(`Expected Equals symbol ${eq !== undefined ? `at pos ${showLoc(eq.loc)} ` : `after ${head.loc.end}`}, but found ${eq?._tag}`)

  const [remainingTokens, value] = parseExpr(tail)
  return [remainingTokens, AST.LetDeclaration(head.value, value, Location(start, value.loc.end))]
}

function parseExpr(tokens: Token[]): [Token[], AST.Expr] {
  // return parseAdditiveExpr(tokens)
  return parseObjectExpr(tokens)
}

function parseFunDeclaration(tokens: Token[], start: number): [Token[], AST.Expr] {
  const [name, open, ...tail] = tokens

  if (!isIdentifierToken(name)) throw new Error(`Expected identifier for fuction name at??`)
  if (!isOpenParenToken(open)) throw new Error(`Expected open parenthesis for function arg list`)

  const [[t, ...remainingTokens], args] = parseArgs(tail)
  if (!args.every<AST.Identifier>(AST.isIdentifier)) throw new Error(`Expected identifier list for fun parameters at??`)
  if (!isOpenBraceToken(t)) throw new Error(`Expected OpenBrace token to start function body at???`)

  const _parseBody = (tokens: Token[], body: AST.Expr[]): [Token[], AST.Expr[], number] => {
    const [head, ...tail] = tokens

    if (isCloseBraceToken(head)) return [tail, body, head.loc.end]

    const [remainingTokens, expr] = parseStatement(tokens)
    return _parseBody(remainingTokens, A.push(expr, body))
  }

  const [remainingTokens2, body, end] = _parseBody(remainingTokens, A.empty<AST.Expr>())

  return [remainingTokens2, AST.FunDeclaration(name.value, args.map(s => s.symbol), body, Location(start, end))]

}

function parseStatement(tokens: Token[]): [Token[], AST.Expr] {
  const [head, ...tail] = tokens

  if (isLetToken(head)) return parseLetDeclaration(tail, head.loc.start)

  if (isFunToken(head)) return parseFunDeclaration(tail, head.loc.start)

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
export function produceAST(raw: string[]): AST.Program {
  const _produceAST = (tokens: Token[], exprs: AST.Expr[], start: number, end: number): [number, number, AST.Expr[]] => {
    if (!A.isNonEmpty(tokens)) return [start, end, exprs]

    const t = A.head(tokens)

    if (isEofToken(t)) return [start, end, exprs]

    const [remainingTokens, es] = parseStatement(tokens)
    return _produceAST(remainingTokens, A.push(es, exprs), start, es.loc.end)
  }

  const tokens = raw.flatMap(tokenise)

  const [start, end, body] = _produceAST(tokens, [], 0, 0)
  return AST.Program(start, end, body)
}
