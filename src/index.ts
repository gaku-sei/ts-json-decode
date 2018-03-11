export type Decoder<T> = (value: any) => value is T;

export interface DecoderDict {
  [key: string]: Decoder<any>;
}

export type DecoderValueDict<T extends DecoderDict> = {
  [K in keyof T]: T[K] extends Decoder<infer U> ? U : never
};

// Please... https://github.com/Microsoft/TypeScript/issues/5453
export interface Composeable {
  <A, B>(decoder1: Decoder<A>, decoder2: Decoder<B>): Decoder<A | B>;

  <A, B, C>(
    decoder1: Decoder<A>,
    decoder2: Decoder<B>,
    decoder3: Decoder<C>,
  ): Decoder<A | B | C>;

  <A, B, C, D>(
    decoder1: Decoder<A>,
    decoder2: Decoder<B>,
    decoder3: Decoder<C>,
    decoder4: Decoder<D>,
  ): Decoder<A | B | C | D>;

  <A, B, C, D, E>(
    decoder1: Decoder<A>,
    decoder2: Decoder<B>,
    decoder3: Decoder<C>,
    decoder4: Decoder<D>,
    decoder5: Decoder<E>,
  ): Decoder<A | B | C | D | E>;

  <A, B, C, D, E, F>(
    decoder1: Decoder<A>,
    decoder2: Decoder<B>,
    decoder3: Decoder<C>,
    decoder4: Decoder<D>,
    decoder5: Decoder<E>,
    decoder6: Decoder<F>,
  ): Decoder<A | B | C | D | E | F>;

  <A, B, C, D, E, F, G>(
    decoder1: Decoder<A>,
    decoder2: Decoder<B>,
    decoder3: Decoder<C>,
    decoder4: Decoder<D>,
    decoder5: Decoder<E>,
    decoder6: Decoder<F>,
    decoder7: Decoder<G>,
  ): Decoder<A | B | C | D | E | F | G>;

  <A, B, C, D, E, F, G, H>(
    decoder1: Decoder<A>,
    decoder2: Decoder<B>,
    decoder3: Decoder<C>,
    decoder4: Decoder<D>,
    decoder5: Decoder<E>,
    decoder6: Decoder<F>,
    decoder7: Decoder<G>,
    decoder8: Decoder<H>,
  ): Decoder<A | B | C | D | E | F | G | H>;

  <A, B, C, D, E, F, G, H, I>(
    decoder1: Decoder<A>,
    decoder2: Decoder<B>,
    decoder3: Decoder<C>,
    decoder4: Decoder<D>,
    decoder5: Decoder<E>,
    decoder6: Decoder<F>,
    decoder7: Decoder<G>,
    decoder8: Decoder<H>,
    decoder9: Decoder<I>,
  ): Decoder<A | B | C | D | E | F | G | H | I>;

  <A, B, C, D, E, F, G, H, I, J>(
    decoder1: Decoder<A>,
    decoder2: Decoder<B>,
    decoder3: Decoder<C>,
    decoder4: Decoder<D>,
    decoder5: Decoder<E>,
    decoder6: Decoder<F>,
    decoder7: Decoder<G>,
    decoder8: Decoder<H>,
    decoder9: Decoder<I>,
    decoder10: Decoder<J>,
  ): Decoder<A | B | C | D | E | F | G | H | I | J>;
}

export const decode = <T>(decoder: Decoder<T>, input: string): Promise<T> =>
  new Promise((resolve, reject) => {
    try {
      const output = JSON.parse(input);

      if (!decoder(output)) {
        return reject(
          new Error(
            `The provided value ${JSON.stringify(
              output,
              null,
              2,
            )} is not valid`,
          ),
        );
      }

      resolve(output);
    } catch {
      reject(new Error(`Could not parse input: ${input}`));
    }
  });

const isPlainObject = (value: any): boolean => {
  if (typeof value !== "object") {
    return false;
  }

  if (Object.prototype.toString.call(value) !== "[object Object]") {
    return false;
  }

  return true;
};

export const str: Decoder<string> = (value): value is string =>
  typeof value === "string";

export const num: Decoder<number> = (value): value is number =>
  typeof value === "number";

export const bool: Decoder<boolean> = (value): value is boolean =>
  typeof value === "boolean";

export const nil: Decoder<null> = (value): value is null => value === null;

export const array = <T>(decoder: Decoder<T>): Decoder<Array<T>> => (
  value,
): value is Array<T> => {
  if (!Array.isArray(value)) {
    return false;
  }

  return !value.some(v => !decoder(v));
};

export const oneOf: Composeable = (...decoders: Array<Decoder<any>>) => (
  value: any,
): value is any => decoders.some(decoder => decoder(value));

export const nullable = <T>(decoder: Decoder<T>): Decoder<T | null> =>
  oneOf(nil, decoder);

export const maybe = <T>(decoder: Decoder<T>): Decoder<T | undefined> =>
  oneOf((value): value is undefined => value === undefined, decoder);

export const object = <T extends DecoderDict>(
  decoders: T,
): Decoder<DecoderValueDict<T>> => (value): value is DecoderValueDict<T> => {
  if (!isPlainObject(value)) {
    return false;
  }

  for (const key in decoders) {
    if (!decoders[key](value[key])) {
      return false;
    }
  }

  return true;
};

export const compose: Composeable = (...decoders: Decoder<any>[]) => (
  value: any,
): value is any => {
  return !decoders.some(decoder => !decoder(value));
};
