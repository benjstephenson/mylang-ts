import * as A from "../array.ts"
import { Expr, Identifier, InfixExpr, NumericLiteral, Program } from "./ast.ts"
import { tokenise } from "../lex/lexer.ts"
import { Token, TokenType, isInfixOperatorToken } from "../lex/Tokens.ts"

function popExpected(tokenType: TokenType, tokens: Token[]): Token[] {
  const [head, ...tail] = tokens

  if (head && head._tag !== tokenType) {
    throw new Error(`Expected ${tokenType} but found ${head._tag}`)
  }
  return tail
}



function parsePrimaryExpr(tokens: Token[]): [Token[], Expr] {
  const [token, ...tail] = tokens

  if (token === undefined) throw new Error("Unexpected end of token list")

  switch (token._tag) {
    case "Identifier":
      return [tail, Identifier(token.value)]
    case "Number":
      return [tail, NumericLiteral(parseFloat(token.value))]

    case "OpenParen": {
      const [remainingTokens, expr] = parseExpr(tail)
      return [popExpected("CloseParen", remainingTokens), expr]
    }

    default:
      throw new Error(`Unexpected token [${JSON.stringify(token)}]`)
  }
}

function buildExprParser(infixOperators: string[], parser: (tokens: Token[]) => [Token[], Expr]): (tokens: Token[]) => [Token[], Expr] {

  const _parse = (tokens: Token[], expr: Expr,): [Token[], Expr] => {

    const [head, ...tail] = tokens

    if (!isInfixOperatorToken(head) || !infixOperators.includes(head.value)) return [tokens, expr]

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

const parseExponentialExpr = buildExprParser(["^"], parsePrimaryExpr)
const parseMultiplicativeExpr = buildExprParser(["/", "*", "%"], parseExponentialExpr)
const parseAdditiveExpr = buildExprParser(["+", "-"], parseMultiplicativeExpr)


function parseExpr(tokens: Token[]): [Token[], Expr] {
  return parseAdditiveExpr(tokens)
}

export function produceAST(raw: string): Program {

  const _produceAST = (tokens: Token[], exprs: Expr[]): Expr[] => {
    if (!A.isNonEmpty(tokens)) return exprs

    const t = A.head(tokens)

    if (t._tag === "Eof") return exprs

    const [remainingTokens, es] = parseExpr(tokens)
    return _produceAST(remainingTokens, A.push(es, exprs))
  }

  const tokens = tokenise(raw)

  const program = Program()

  return { ...program, body: _produceAST(tokens, []) }
}
