import { pipe, tuple } from './functions'

export type State<U, T> = (state: U) => [U, T]

export const of =
  <U, T>(value: T): State<U, T> =>
    (seed: U) =>
      [seed, value]

export const run =
  <U, T>(state: State<U, T>) =>
    (seed: U) =>
      state(seed)[1]

export const map: <U, A, B>(f: (a: A) => B) => (fa: State<U, A>) => State<U, B> = (f) => (generate) => (seed) => {
  const [nextSeed, a] = generate(seed)
  return [nextSeed, f(a)]
}

export const chain: <U, A, B>(f: (a: A) => State<U, B>) => (ma: State<U, A>) => State<U, B> = (f) => (ma) => (seed) => {
  const [nextSeed, a] = ma(seed)
  return f(a)(nextSeed)
}
