export type NonEmptyArray<T> = [T, ...T[]]

export const isNonEmpty = <T>(xs: T[]): xs is NonEmptyArray<T> => xs.length > 0
export const isEmpty = <T>(xs: T[]): xs is [] => !isNonEmpty(xs)

export const head = <T>(xs: NonEmptyArray<T>): T => xs[0]

export const tail = <T>(xs: T[]): T[] => {
  const [_, ...tail] = xs
  return tail || []
}

export const empty = <T>(): T[] => [] as T[]

export const push = <T, R extends T>(x: R, xs: T[]): NonEmptyArray<T> => {
  xs.push(x)
  return xs as NonEmptyArray<T>
}

export const popExpected = <T>(t: T, ts: T[]): T[] => {
  const [head, ...tail] = ts

  if (head !== t) throw new Error(`Expected ${t} at first element`)

  return tail
}


export const zip = <A, B>(a: A[], b: B[]): [A, B][] => {
  return a.reduce((acc, v, i) => {
    const _b = b[i]
    return _b === undefined ? acc : push([v, _b], acc)
  }, empty<[A, B]>())
}
