
export type ElementOf<T extends readonly unknown[]> = T extends readonly (infer ET)[] ? ET : never;
