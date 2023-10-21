import { SymbolToToken, isKnownSymbol } from "../Symbols.ts"
import { push, tail, isNonEmpty } from "../array.ts"
import { keywordOrIdentifier } from "./ReservedKeywords.ts"
import { EofToken, NumberToken, Token } from "./Tokens.ts"

const isAlpha = (str: string): boolean =>
  str.toUpperCase() !== str.toLowerCase()

const isNumber = (str: string): boolean => {
  const c = str.charCodeAt(0)
  const [lower, upper] = ["0".charCodeAt(0), "9".charCodeAt(0)]
  return c >= lower && c <= upper
}

const isSkippable = (str: string): boolean =>
  [" ", "\t", "\n", "\r"].includes(str)

const getTokeniser = (predicate: (s: string) => boolean) =>
  (chrs: string[]): [string[], string] => {
    const _tokenise = (chrs: string[], token: string): [string[], string] => {

      if (!isNonEmpty(chrs)) return [chrs, token]

      const [head, ...tail] = chrs

      return !predicate(head)
        ? [chrs, token]
        : _tokenise(tail, token + head)
    }

    return _tokenise(chrs, "")
  }

const tokeniseAlpha = getTokeniser(isAlpha)
const tokeniseNumber = getTokeniser(isNumber)

export function tokenise(raw: string): Token[] {

  const _tokenise = (chrs: string[], tokens: Token[], pos: number): Token[] => {
    if (!isNonEmpty(chrs)) {
      return tokens
    }

    const [c, ...cs] = chrs

    if (isKnownSymbol(c)) {
      return _tokenise(tail(chrs), push(SymbolToToken[c](pos), tokens), ++pos)

    } else {
      if (isNumber(c)) {
        const [remainingChrs, numberStr] = tokeniseNumber(chrs)
        return _tokenise(
          remainingChrs,
          push(NumberToken(numberStr, { start: pos, end: pos + numberStr.length - 1 }), tokens),
          pos + numberStr.length
        )

      } else if (isAlpha(c)) {
        const [remainingChrs, token] = tokeniseAlpha(chrs)

        return _tokenise(
          remainingChrs,
          push(keywordOrIdentifier(token, pos), tokens),
          pos + token.length
        )

      } else if (isSkippable(c)) {
        return _tokenise(cs, tokens, ++pos)

      } else {
        console.log(`Unrecognised character found [${c}]`)
        return tokens
      }
    }
  }

  return push(EofToken, _tokenise(raw.split(""), [], 1))
}
