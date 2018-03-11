export type Decoder<T> = (value: any) => Promise<T>;

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

export interface Map {
  <A, B>(f: (value: A) => B, decoder: Decoder<A>): Decoder<B>;

  <A, B, C>(
    f: (value1: A, value2: B) => C,
    decoder1: Decoder<A>,
    decoder2: Decoder<B>,
  ): Decoder<C>;

  <A, B, C, D>(
    f: (value1: A, value2: B, value3: C) => D,
    decoder1: Decoder<A>,
    decoder2: Decoder<B>,
    decoder3: Decoder<C>,
  ): Decoder<D>;

  <A, B, C, D, E>(
    f: (value1: A, value2: B, value3: C, value4: D) => E,
    decoder1: Decoder<A>,
    decoder2: Decoder<B>,
    decoder3: Decoder<C>,
    decoder4: Decoder<D>,
  ): Decoder<E>;

  <A, B, C, D, E, F>(
    f: (value1: A, value2: B, value3: C, value4: D, value5: E) => F,
    decoder1: Decoder<A>,
    decoder2: Decoder<B>,
    decoder3: Decoder<C>,
    decoder4: Decoder<D>,
    decoder5: Decoder<E>,
  ): Decoder<F>;

  <A, B, C, D, E, F, G>(
    f: (value1: A, value2: B, value3: C, value4: D, value5: E, value6: F) => G,
    decoder1: Decoder<A>,
    decoder2: Decoder<B>,
    decoder3: Decoder<C>,
    decoder4: Decoder<D>,
    decoder5: Decoder<E>,
    decoder6: Decoder<F>,
  ): Decoder<G>;

  <A, B, C, D, E, F, G, H>(
    f: (
      value1: A,
      value2: B,
      value3: C,
      value4: D,
      value5: E,
      value6: F,
      value7: G,
    ) => H,
    decoder1: Decoder<A>,
    decoder2: Decoder<B>,
    decoder3: Decoder<C>,
    decoder4: Decoder<D>,
    decoder5: Decoder<E>,
    decoder6: Decoder<F>,
    decoder7: Decoder<G>,
  ): Decoder<H>;

  <A, B, C, D, E, F, G, H, I>(
    f: (
      value1: A,
      value2: B,
      value3: C,
      value4: D,
      value5: E,
      value6: F,
      value7: G,
      value8: H,
    ) => I,
    decoder1: Decoder<A>,
    decoder2: Decoder<B>,
    decoder3: Decoder<C>,
    decoder4: Decoder<D>,
    decoder5: Decoder<E>,
    decoder6: Decoder<F>,
    decoder7: Decoder<G>,
    decoder8: Decoder<H>,
  ): Decoder<I>;

  <A, B, C, D, E, F, G, H, I, J>(
    f: (
      value1: A,
      value2: B,
      value3: C,
      value4: D,
      value5: E,
      value6: F,
      value7: G,
      value8: H,
      value9: I,
    ) => J,
    decoder1: Decoder<A>,
    decoder2: Decoder<B>,
    decoder3: Decoder<C>,
    decoder4: Decoder<D>,
    decoder5: Decoder<E>,
    decoder6: Decoder<F>,
    decoder7: Decoder<G>,
    decoder8: Decoder<H>,
    decoder9: Decoder<I>,
  ): Decoder<J>;

  <A, B, C, D, E, F, G, H, I, J, K>(
    f: (
      value1: A,
      value2: B,
      value3: C,
      value4: D,
      value5: E,
      value6: F,
      value7: G,
      value8: H,
      value9: I,
      value10: J,
    ) => K,
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
  ): Decoder<K>;
}

export const decodeString = <T>(decoder: Decoder<T>) => async (
  input: string,
): Promise<T> => {
  let json: any;

  try {
    json = JSON.parse(input);
  } catch {
    throw new Error(`Could not parse input: ${input}`);
  }

  return decoder(json);
};

export const decodeValue = <T>(decoder: Decoder<T>) => async (
  input: any,
): Promise<T> => decoder(input);

const isPlainObject = (value: any): boolean => {
  if (typeof value !== "object") {
    return false;
  }

  return Object.prototype.toString.call(value) === "[object Object]";
};

export const simpleDecoder = <T>(type: string, f: (value: any) => boolean) => (
  value: any,
): Promise<T> =>
  f(value)
    ? Promise.resolve(value)
    : Promise.reject(new Error(`Expected ${type} but got ${typeof value}`));

export const str: Decoder<string> = simpleDecoder(
  "string",
  value => typeof value === "string",
);

export const num: Decoder<number> = simpleDecoder(
  "number",
  value => typeof value === "number",
);

export const bool: Decoder<boolean> = simpleDecoder(
  "boolean",
  value => typeof value === "boolean",
);

export const nil: Decoder<null> = simpleDecoder(
  "null",
  value => value === null,
);

export const array = <T>(decoder: Decoder<T>): Decoder<Array<T>> => async (
  values,
): Promise<Array<T>> => {
  if (!Array.isArray(values)) {
    return Promise.reject(new Error(`Expected array but got ${typeof values}`));
  }

  for (const value of values) {
    await decoder(value);
  }

  return Promise.resolve(values);
};

export const oneOf: Composeable = (...decoders: Array<Decoder<any>>) => async (
  value: any,
) => {
  for (const decoder of decoders) {
    try {
      await decoder(value);

      return Promise.resolve(value);
    } catch {}
  }

  return Promise.reject(
    new Error(`Expected one of the provided decoders but got ${typeof value}`),
  );
};

export const nullable = <T>(decoder: Decoder<T>): Decoder<T | null> =>
  oneOf(nil, decoder);

export const maybe = <T>(decoder: Decoder<T>): Decoder<T | undefined> =>
  oneOf(
    simpleDecoder<undefined>("undefined", value => value === undefined),
    decoder,
  );

export const object = <T extends DecoderDict>(
  decoders: T,
): Decoder<DecoderValueDict<T>> => async (
  value,
): Promise<DecoderValueDict<T>> => {
  if (!isPlainObject(value)) {
    return Promise.reject(
      new Error(`Expected an object but got ${typeof value}`),
    );
  }

  for (const key in decoders) {
    await decoders[key](value[key]);
  }

  return Promise.resolve(value);
};

export const field = <T>(
  name: string,
  decoder: Decoder<T>,
): Decoder<T> => async (value): Promise<T> => await decoder(value[name]);

export const compose: Composeable = (...decoders: Decoder<any>[]) => async (
  value: any,
): Promise<any> => {
  for (const decoder of decoders) {
    await decoder(value);
  }

  return Promise.resolve(value);
};

export const map: Map = (
  f: (...value: any[]) => any,
  ...decoders: Array<Decoder<any>>
) => async (value: any) =>
  f(...(await Promise.all(decoders.map(decoder => decoder(value)))));
