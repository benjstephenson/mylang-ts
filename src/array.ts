export type NonEmptyArray<T> = {
  0: T;
} & T[];

export const head = <T>(xs: NonEmptyArray<T>): T => xs[0];

export const tail = <T>(xs: T[]): T[] => {
  const [_, ...tail] = xs;
  return tail;
};

export const push = <T>(x: T, xs: T[]): NonEmptyArray<T> => {
  xs.push(x);
  return xs as NonEmptyArray<T>;
};

export const popExpected = <T>(t: T, ts: T[]): T[] => {
  const [head, ...tail] = ts;

  if (head !== t) throw new Error(`Expected ${t} at first element`);

  return tail;
};
