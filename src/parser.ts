import * as A from "./array.ts";
import { Expr, Identifier, InfixExpr, NumericLiteral, Program } from "./ast.ts";
import { Token, tokenise, TokenType } from "./lexer.ts";

function popExpected(tokenType: TokenType, tokens: Token[]): Token[] {
  const [head, ...tail] = tokens;

  if (head.type !== tokenType) {
    throw new Error(`Expected ${tokenType} but found ${head.type}`);
  }
  return tail;
}

function _produceAST(tokens: Token[], exprs: Expr[]): Expr[] {
  if (tokens.length <= 0) return exprs;

  const [t, ...tail] = tokens;
  if (t.type === "Eof") return exprs;

  const [remainingTokens, es] = parseExpr(tokens);
  return _produceAST(remainingTokens, A.push(es, exprs));
}

function parsePrimaryExpr(tokens: Token[]): [Token[], Expr] {
  const [token, ...tail] = tokens;

  switch (token.type) {
    case "Identifier":
      return [tail, Identifier(token.value)];
    case "Number":
      return [tail, NumericLiteral(parseFloat(token.value))];

    case "OpenParen": {
      const [remainingTokens, expr] = parseExpr(tail);
      return [popExpected("CloseParen", remainingTokens), expr];
    }

    default:
      throw new Error(`Unexpected token [${JSON.stringify(token)}]`);
  }
}

function parseMultiplicativeExpr(tokens: Token[]): [Token[], Expr] {
  const [remainingTokens, left] = parsePrimaryExpr(tokens);

  const _parseMultiplicative = (
    tokens: Token[],
    expr: Expr,
  ): [Token[], Expr] => {
    const [head, ...tail] = tokens;
    if (!["/", "*", "%"].includes(head.value)) return [tokens, expr];

    const operator = head.value;
    const [remainingTokens, right] = parsePrimaryExpr(tail);

    return _parseMultiplicative(
      remainingTokens,
      InfixExpr(expr, right, operator),
    );
  };

  return _parseMultiplicative(remainingTokens, left);
}

function parseAdditiveExpr(tokens: Token[]): [Token[], Expr] {
  const [remainingTokens, left] = parseMultiplicativeExpr(tokens);

  const _parseAdditive = (tokens: Token[], expr: Expr): [Token[], Expr] => {
    const [head, ...tail] = tokens;
    if (!["+", "-"].includes(head.value)) return [tokens, expr];

    const operator = head.value;
    const [remainingTokens, right] = parseMultiplicativeExpr(tail);

    return _parseAdditive(remainingTokens, InfixExpr(expr, right, operator));
  };

  return _parseAdditive(remainingTokens, left);
}

function parseExpr(tokens: Token[]): [Token[], Expr] {
  return parseAdditiveExpr(tokens);
}

export function produceAST(raw: string): Program {
  const tokens = tokenise(raw);

  const program: Program = {
    kind: "Program",
    body: [],
  };

  return { ...program, body: _produceAST(tokens, []) };
}
