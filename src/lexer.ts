import { push, tail } from "./array.ts";

export type TokenType =
  | "Number"
  | "Identifier"
  | "Let"
  | "Equals"
  | "OpenParen"
  | "CloseParen"
  | "InfixOperator"
  | "Eof";

const ReservedKeywords: Readonly<Record<string, TokenType>> = {
  "let": "Let",
};

const OpenParen = "(";
const CloseParen = ")";
const EqualsSym = "=";
const PlusSym = "+";
const MinusSym = "-";
const AsteriskSym = "*";
const ModulusSym = "%";
const HatSym = "^";
const BackSlash = "\\";
const Slash = "/";
const InfixOperators = [PlusSym, MinusSym, AsteriskSym, ModulusSym, Slash, HatSym];

export type Token = {
  value: string;
  type: TokenType;
};

const Token = (value: string, type: TokenType): Token => ({ value, type });

const isAlpha = (str: string): boolean =>
  str.toUpperCase() !== str.toLowerCase();

const isNumber = (str: string): boolean => {
  const c = str.charCodeAt(0);
  const [lower, upper] = ["0".charCodeAt(0), "9".charCodeAt(0)];
  return c >= lower && c <= upper;
};

const isSkippable = (str: string): boolean =>
  [" ", "\t", "\n", "\r"].includes(str);

const getTokeniser = (predicate: (s: string) => boolean) =>
  (
    chrs: string[],
  ): [string[], string] => {
    const _tokenise = (chrs: string[], token: string): [string[], string] => {
      const [head, ...tail] = chrs;
      return chrs.length <= 0 || !predicate(head)
        ? [chrs, token]
        : _tokenise(tail, token + head);
    };

    return _tokenise(chrs, "");
  };

const tokeniseAlpha = getTokeniser(isAlpha);
const tokeniseNumber = getTokeniser(isNumber);

export function tokenise(raw: string): Token[] {
  const _tokenise = (chrs: string[], tokens: Token[]): Token[] => {
    if (chrs.length <= 0) {
      return tokens;
    }

    const [c, ...cs] = chrs;
    if (c === OpenParen) {
      return _tokenise(tail(chrs), push(Token(c, "OpenParen"), tokens));
    } else if (c === CloseParen) {
      return _tokenise(tail(chrs), push(Token(c, "CloseParen"), tokens));
    } else if (InfixOperators.includes(c)) {
      return _tokenise(tail(chrs), push(Token(c, "InfixOperator"), tokens));
    } else if (c === EqualsSym) {
      return _tokenise(tail(chrs), push(Token(c, "Equals"), tokens));
    } else {
      if (isNumber(c)) {
        const [remainingChrs, numberStr] = tokeniseNumber(chrs);
        return _tokenise(
          remainingChrs,
          push(Token(numberStr, "Number"), tokens),
        );
      } else if (isAlpha(c)) {
        const [remainingChrs, token] = tokeniseAlpha(chrs);

        return _tokenise(
          remainingChrs,
          push(Token(token, ReservedKeywords[token] || "Identifier"), tokens),
        );
      } else if (isSkippable(c)) {
        return _tokenise(cs, tokens);
      } else {
        console.log(`Unrecognised character found [${c}]`);
        return tokens;
      }
    }
  };

  return push(Token("eof", "Eof"), _tokenise(raw.split(""), []));
}
