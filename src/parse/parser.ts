import * as A from "../array.ts";
import {
  Expr,
  Identifier,
  InfixExpr,
  LetDeclaration,
  NumericLiteral,
  ObjectLiteral,
  Program,
  Property,
} from "./ast.ts";
import { tokenise } from "../lex/lexer.ts";
import {
  IdentifierToken,
  isCloseBraceToken,
  isColonToken,
  isEofToken,
  isEqualsToken,
  isIdentifierToken,
  isInfixOperatorToken,
  isLetToken,
  isOpenBraceToken,
  Token,
  TokenType,
} from "../lex/Tokens.ts";
import { InfixOperator, Symbols } from "../Symbols.ts";

function popExpected(tokenType: TokenType, tokens: Token[]): Token[] {
  const [head, ...tail] = tokens;

  if (head && head._tag !== tokenType) {
    throw new Error(`Expected ${tokenType} but found ${head._tag}`);
  }
  return tail;
}

function parsePrimaryExpr(tokens: Token[]): [Token[], Expr] {
  const [token, ...tail] = tokens;

  if (token === undefined) throw new Error("Unexpected end of token list");

  switch (token._tag) {
    case "Identifier":
      return [tail, Identifier(token.value)];
    case "Number":
      return [tail, NumericLiteral(parseFloat(token.value))];

    case "OpenParen": {
      const [remainingTokens, expr] = parseExpr(tail);
      return [popExpected("CloseParen", remainingTokens), expr];
    }

    default:
      throw new Error(`Unexpected token [${token._tag}]`);
  }
}

function buildExprParser(
  operators: InfixOperator[],
  parser: (tokens: Token[]) => [Token[], Expr],
): (tokens: Token[]) => [Token[], Expr] {
  const _parse = (tokens: Token[], expr: Expr): [Token[], Expr] => {
    const [head, ...tail] = tokens;

    if (!isInfixOperatorToken(head) || !operators.includes(head.value)) {
      return [tokens, expr];
    }

    const operator = head.value;
    const [remainingTokens, right] = parser(tail);

    return _parse(
      remainingTokens,
      InfixExpr(expr, right, operator),
    );
  };

  return (tokens: Token[]): [Token[], Expr] => {
    const [remainingTokens, left] = parser(tokens);
    return _parse(remainingTokens, left);
  };
}

const parseExponentialExpr = buildExprParser([Symbols.Caret], parsePrimaryExpr);
const parseMultiplicativeExpr = buildExprParser([
  Symbols.Slash,
  Symbols.Asterisk,
  Symbols.Percent,
], parseExponentialExpr);
const parseAdditiveExpr = buildExprParser(
  [Symbols.Plus, Symbols.Minus],
  parseMultiplicativeExpr,
);

function parseObjectExpr(tokens: Token[]): [Token[], Expr] {
  const [head, ...tail] = tokens;

  if (!isOpenBraceToken(head)) return parseAdditiveExpr(tokens);

  const _parseObjectExpr = (
    tokens: Token[],
    props: Property[],
  ): [Token[], Property[]] => {
    const [head, t, ...tail] = tokens;

    if (!head || isCloseBraceToken(head) || isEofToken(head)) {
      return [[t!, ...tail], props];
    }

    if (!t) {
      throw new Error(`Uneven object literal, ${isIdentifierToken(head)
          ? `${head.value} must have a value`
          : `no named value to assign`
        }`);
    }

    if (isIdentifierToken(head)) {
      const [remainingTokens, expr] = parseExpr([t, ...tail]);
      return _parseObjectExpr(
        remainingTokens,
        A.push(Property(head.value, expr), props),
      );
    }

    if (isColonToken(head)) {
      if (isIdentifierToken(t)) {
        return _parseObjectExpr(tail, A.push(Property(t.value), props));
      }

      throw new Error(
        `Cannot assign a ${t._tag} expression to a naked identifier in object literal`,
      );
    }

    throw new Error(`Invalid identifier ${head._tag} in object literal`);
  };

  const [remainingTokens, properties] = _parseObjectExpr(tail, []);
  return [remainingTokens, ObjectLiteral(properties)];
}

function parseDeclaration(tokens: Token[]): [Token[], Expr] {
  const [head, eq, ...tail] = tokens;

  if (!isIdentifierToken(head)) return parseExpr(tokens);
  if (!isEqualsToken(eq)) throw new Error("oops");

  const [remainingTokens, value] = parseExpr(tail);
  return [remainingTokens, LetDeclaration(head.value, value)];
}

function parseExpr(tokens: Token[]): [Token[], Expr] {
  return parseAdditiveExpr(tokens);
  // return parseObjectExpr(tokens)
}

function parseStatement(tokens: A.NonEmptyArray<Token>): [Token[], Expr] {
  const [head, ...tail] = tokens;

  if (isLetToken(head)) return parseDeclaration(tail);

  return parseExpr(tokens);
}

export function produceAST(raw: string[]): Program {
  const _produceAST = (tokens: Token[], exprs: Expr[]): Expr[] => {
    if (!A.isNonEmpty(tokens)) return exprs;

    const t = A.head(tokens);

    if (t._tag === "Eof") return exprs;

    const [remainingTokens, es] = parseStatement(tokens);
    return _produceAST(remainingTokens, A.push(es, exprs));
  };

  const tokens = raw.flatMap(tokenise);

  console.log(tokens);
  const program = Program();
  return { ...program, body: _produceAST(tokens, []) };
}
