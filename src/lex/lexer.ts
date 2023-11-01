import { SymbolToToken, Symbols, isKnownSymbol } from "../Symbols"
import { isNonEmpty, push, tail } from "../array"
import { Location } from "../types"
import { keywordOrIdentifier } from "./ReservedKeywords"
import { EofToken, NumberToken, StringToken, Token } from "./Tokens"

const isAlpha = (str: string): boolean =>
  str.toUpperCase() !== str.toLowerCase()

const isQuote = (str: string): boolean => str === "\""

const isNumber = (str: string): boolean => {
  const c = str.charCodeAt(0)
  const [lower, upper] = ["0".charCodeAt(0), "9".charCodeAt(0)]
  return c >= lower && c <= upper
}

const isSkippable = (str: string): boolean =>
  [" ", "\t", "\n", "\r"].includes(str)

const getTokeniser = (predicate: (s: string) => boolean, consumeLast: boolean = false) =>
  (chrs: string[]): [string[], string] => {
    const _tokenise = (chrs: string[], token: string): [string[], string] => {

      if (!isNonEmpty(chrs)) return [chrs, token]

      const [head, ...tail] = chrs

      return predicate(head)
        ? _tokenise(tail, token + head)
        : consumeLast ? [tail, token] : [chrs, token]
    }

    return _tokenise(chrs, "")
  }

const tokeniseAlpha = getTokeniser(isAlpha)
const tokeniseNumber = getTokeniser(isNumber)
const tokeniseString = getTokeniser(s => !isQuote(s), true)

export function tokenise(raw: string): Token[] {

  const _tokenise = (chrs: string[], tokens: Token[], pos: number): Token[] => {
    if (!isNonEmpty(chrs)) {
      return tokens
    }

    const [c, ...cs] = chrs

    if (isKnownSymbol(c)) {

      // is a comment
      if (c === Symbols.Slash && (cs !== undefined && cs[0] === Symbols.Slash)) {
        const idx = chrs.findIndex(c => c === "\n")
        return idx === -1
          ? tokens
          : _tokenise(chrs.slice(idx), tokens, pos + (idx + 2))
      }

      return _tokenise(tail(chrs), push(SymbolToToken[c](pos), tokens), ++pos)

    } else {
      if (isNumber(c)) {
        const [remainingChrs, numberStr] = tokeniseNumber(chrs)
        return _tokenise(
          remainingChrs,
          push(NumberToken(numberStr, Location(pos, pos + numberStr.length - 1)), tokens),
          pos + numberStr.length
        )

      } else if (isQuote(c)) {
        const [remainingChrs, token] = tokeniseString(cs)
        return _tokenise(
          remainingChrs,
          push(StringToken(token, pos), tokens),
          pos + token.length
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
        console.log(tokens)
        console.log(`Unrecognised character found [${c}] at character index ${pos}`)
        return tokens
      }
    }
  }

  return push(EofToken, _tokenise(raw.split(""), [], 1))
}
