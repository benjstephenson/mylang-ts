import { Symbols, isInfixOperator } from "../Symbols.ts";
import { push, tail, isNonEmpty } from "../array.ts";
import { keywordOrIdentifier } from "./ReservedKeywords.ts";
import { CloseParenToken, EofToken, EqualsToken, InfixOperatorToken, NumberToken, OpenParenToken, Token } from "./Tokens.ts";

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
  (chrs: string[]): [string[], string] => {
    const _tokenise = (chrs: string[], token: string): [string[], string] => {

      if (!isNonEmpty(chrs)) return [chrs, token]

      const [head, ...tail] = chrs;

      return !predicate(head)
        ? [chrs, token]
        : _tokenise(tail, token + head);
    };

    return _tokenise(chrs, "");
  };

const tokeniseAlpha = getTokeniser(isAlpha);
const tokeniseNumber = getTokeniser(isNumber);

export function tokenise(raw: string): Token[] {
  const _tokenise = (chrs: string[], tokens: Token[]): Token[] => {
    if (!isNonEmpty(chrs)) {
      return tokens;
    }

    const [c, ...cs] = chrs;

    if (c === Symbols.OpenParen) {
      return _tokenise(tail(chrs), push(OpenParenToken, tokens));
    } else if (c === Symbols.CloseParen) {
      return _tokenise(tail(chrs), push(CloseParenToken, tokens));
    } else if (isInfixOperator(c)) {
      return _tokenise(tail(chrs), push(InfixOperatorToken(c), tokens));
    } else if (c === Symbols.Equals) {
      return _tokenise(tail(chrs), push(EqualsToken, tokens));
    } else {
      if (isNumber(c)) {
        const [remainingChrs, numberStr] = tokeniseNumber(chrs);
        return _tokenise(
          remainingChrs,
          push(NumberToken(numberStr), tokens),
        );
      } else if (isAlpha(c)) {
        const [remainingChrs, token] = tokeniseAlpha(chrs);

        return _tokenise(
          remainingChrs,
          push(keywordOrIdentifier(token), tokens),
        );
      } else if (isSkippable(c)) {
        return _tokenise(cs, tokens);
      } else {
        console.log(`Unrecognised character found [${c}]`);
        return tokens;
      }
    }
  };

  return push(EofToken, _tokenise(raw.split(""), []));
}
