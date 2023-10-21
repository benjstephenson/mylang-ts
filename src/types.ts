
export type PropertyOf<T extends Record<string, any>> = T extends Record<string, infer ET> ? ET : never;
export type ElementOf<T extends readonly unknown[]> = T extends readonly (infer ET)[] ? ET : never;

export const ExhaustiveMatchError = (_: never) => { throw new Error() }

export type Location = {
  _tag: "Location",
  start: number,
  end: number
}

export const Location = (start: number, end: number): Location => ({ _tag: "Location", start, end })

export const showLoc = (l: Location): string => `${l.start}-${l.end}`
