import { IdentifierToken, LetToken, Token } from "./Tokens.ts"

export const ReservedKeywords: Readonly<Record<string, (start: number) => Token>> = {
  "let": LetToken,
};

export const keywordOrIdentifier = (token: string, start: number): Token => {
  const keyword = ReservedKeywords[token]
  return keyword
    ? keyword(start)
    : IdentifierToken(token, start)
}


