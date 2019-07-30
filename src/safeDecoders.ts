import {
  Decoder,
  DecodeError,
  DecoderDict,
  DecoderValueDict,
  getAccurateTypeOf,
} from "./shared";

export interface Composeable {
  <A, B>(decoder1: Decoder<A>, decoder2: Decoder<B>): Decoder<A & B>;
  <A, B, C>(
    decoder1: Decoder<A>,
    decoder2: Decoder<B>,
    decoder3: Decoder<C>,
  ): Decoder<A & B & C>;
  <A, B, C, D>(
    decoder1: Decoder<A>,
    decoder2: Decoder<B>,
    decoder3: Decoder<C>,
    decoder4: Decoder<D>,
  ): Decoder<A & B & C & D>;
  <A, B, C, D, E>(
    decoder1: Decoder<A>,
    decoder2: Decoder<B>,
    decoder3: Decoder<C>,
    decoder4: Decoder<D>,
    decoder5: Decoder<E>,
  ): Decoder<A & B & C & D & E>;
  <A, B, C, D, E, F>(
    decoder1: Decoder<A>,
    decoder2: Decoder<B>,
    decoder3: Decoder<C>,
    decoder4: Decoder<D>,
    decoder5: Decoder<E>,
    decoder: Decoder<F>,
  ): Decoder<A & B & C & D & E & F>;
  <A, B, C, D, E, F, G>(
    decoder1: Decoder<A>,
    decoder2: Decoder<B>,
    decoder3: Decoder<C>,
    decoder4: Decoder<D>,
    decoder5: Decoder<E>,
    decoder6: Decoder<F>,
    decoder7: Decoder<G>,
  ): Decoder<A & B & C & D & E & F & G>;
  <A, B, C, D, E, F, G, H>(
    decoder1: Decoder<A>,
    decoder2: Decoder<B>,
    decoder3: Decoder<C>,
    decoder4: Decoder<D>,
    decoder5: Decoder<E>,
    decoder6: Decoder<F>,
    decoder7: Decoder<G>,
    decoder8: Decoder<H>,
  ): Decoder<A & B & C & D & E & F & G & H>;
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
  ): Decoder<A & B & C & D & E & F & G & H & I>;
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
  ): Decoder<A & B & C & D & E & F & G & H & I & J>;
}

export interface OneOf {
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
    decoder: Decoder<F>,
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

export type Map = <Decoders extends Array<Decoder<any>>, T>(
  f: (
    ...values: {
      [key in keyof Decoders]: Decoders[key] extends Decoder<infer U>
        ? U
        : never
    }
  ) => T,
  ...decoders: Decoders
) => Decoder<T>;

export type Union = <
  T extends string | number | boolean,
  Values extends Array<T>
>(
  decoder: Decoder<T>,
  ...values: Values
) => Decoder<Values[number]>;

const isPlainObject = (value: any): boolean => {
  if (typeof value !== "object") {
    return false;
  }

  return Object.prototype.toString.call(value) === "[object Object]";
};

export const str: Decoder<string> = value => {
  if (typeof value !== "string") {
    throw new DecodeError("string", getAccurateTypeOf(value));
  }

  return value;
};

export const num: Decoder<number> = value => {
  if (typeof value !== "number") {
    throw new DecodeError("number", getAccurateTypeOf(value));
  }

  return value;
};

export const bool: Decoder<boolean> = value => {
  if (typeof value !== "boolean") {
    throw new DecodeError("boolean", getAccurateTypeOf(value));
  }

  return value;
};

export const nil: Decoder<null> = value => {
  if (value !== null) {
    throw new DecodeError("null", getAccurateTypeOf(value));
  }

  return value;
};

export const array = <T>(decoder: Decoder<T>): Decoder<Array<T>> => (
  values,
): Array<T> => {
  if (!Array.isArray(values)) {
    throw new DecodeError("array", getAccurateTypeOf(values));
  }

  values.forEach(decoder);

  return values;
};

export const oneOf: OneOf = (...decoders: Array<Decoder<any>>) => (
  value: any,
) => {
  let expectations: string[] = [];

  for (const decoder of decoders) {
    try {
      decoder(value);

      return value;
    } catch (error) {
      if (error instanceof DecodeError) {
        expectations = [...expectations, error.expected];
      }
    }
  }

  throw new DecodeError(
    `one of "${expectations.join('" or "')}"`,
    getAccurateTypeOf(value),
  );
};

export const nullable = <T>(decoder: Decoder<T>): Decoder<T | null> =>
  oneOf(nil, decoder);

export const maybe = <T>(decoder: Decoder<T>): Decoder<T | undefined> =>
  oneOf(value => {
    if (value !== undefined) {
      throw new DecodeError("undefined", getAccurateTypeOf(value));
    }

    return value;
  }, decoder);

// Lower versions of TypeScript don't try to infer the subtype of functions parameters,
// Therefore a decoder like `union(str, "foo", "bar")` will result in a `Decoder<string>`
// The only way to prevent this is to provide the generics
// like `union<string, Array<'foo', 'bar'>>(str, 'foo', 'bar')`
export const union: Union = (decoder: Decoder<any>, ...values: Array<any>) =>
  compose(
    decoder,
    value => {
      if (!values.includes(value)) {
        throw new DecodeError(`one of "${values.join('" or "')}"`, value);
      }

      return value;
    },
  );

export const object = <T extends DecoderDict>(
  decoders: T,
): Decoder<DecoderValueDict<T>> => (value): DecoderValueDict<T> => {
  if (!isPlainObject(value)) {
    throw new DecodeError("object", getAccurateTypeOf(value));
  }

  for (const key in decoders) {
    try {
      decoders[key](value[key]);
    } catch (error) {
      if (error instanceof DecodeError) {
        throw new DecodeError(
          `${error.expected} at field "${key}"`,
          error.received,
        );
      }

      throw error;
    }
  }

  return value;
};

// `record` will build a new object at runtime, and should probably not be used for large objects
export const record = <T>(decoder: Decoder<T>): Decoder<Record<string, T>> => (
  value,
): Record<string, T> => {
  // Records are plain object under the hood
  if (!isPlainObject(value)) {
    throw new DecodeError("record", getAccurateTypeOf(value));
  }

  const decodedValue: Record<string, T> = {};

  for (const key in value) {
    if (!Object.prototype.hasOwnProperty.call(value, key)) {
      continue;
    }

    try {
      decodedValue[key] = decoder(value[key]);
    } catch (error) {
      if (error instanceof DecodeError) {
        throw new DecodeError(
          `${error.expected} at field "${key}"`,
          error.received,
        );
      }

      throw error;
    }
  }

  return decodedValue;
};

export const field = <T>(name: string, decoder: Decoder<T>): Decoder<T> => (
  value,
): T => {
  if (!(name in value)) {
    throw new DecodeError(
      `${name} to be an existing attribute of ${JSON.stringify(value)}`,
      "undefined",
    );
  }

  return decoder(value[name]);
};

export const compose: Composeable = (...decoders: Array<Decoder<any>>) => (
  value: any,
) => decoders.reduce((acc, reducer) => reducer(acc), value);

export const map: Map = (
  f: (...values: any) => any,
  ...decoders: Array<Decoder<any>>
) => (value: any) => f(...decoders.map(decoder => decoder(value)));
