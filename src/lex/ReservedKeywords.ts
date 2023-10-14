import { IdentifierToken, LetToken, Token } from "./Tokens.ts"

export const ReservedKeywords: Readonly<Record<string, Token>> = {
  "let": LetToken,
};

export const keywordOrIdentifier = (token: string): Token => ReservedKeywords[token] || IdentifierToken(token)


