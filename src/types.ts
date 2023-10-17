
export type ElementOf<T extends readonly unknown[]> = T extends readonly (infer ET)[] ? ET : never;

export const ExhaustiveMatchError = (_: never) => { throw new Error() }
