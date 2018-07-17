export type Decoder<T> = (value: any) => Promise<T>;

export interface DecoderDict {
  [key: string]: Decoder<any>;
}

export type DecoderValueDict<T extends DecoderDict> = {
  [K in keyof T]: T[K] extends Decoder<infer U> ? U : never
};

export class DecodeError extends Error {
  constructor(expectedType: string, receivedType: string) {
    super(`Expected ${expectedType} but got ${receivedType}`);
  }
}

export type Composeable = <Decoders extends Array<Decoder<any>>>(
  ...decoders: Decoders
) => Decoder<Decoders[number] extends Decoder<infer T> ? T : never>;

export type Map = <Decoders extends Array<Decoder<any>>, T>(
  // TypeScript is not able to fully understand the types of values yet.
  // For example a in a decoder like `map((a, b) => ..., str, num);`,
  // `a` and `b` will have type `string | number` except of `a` being `string` and `b` being `number`
  f: (
    ...values: Array<Decoders[number] extends Decoder<infer U> ? U : never>
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
    : Promise.reject(new DecodeError(type, typeof value));

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
    throw new DecodeError("array", typeof values);
  }

  for (const value of values) {
    await decoder(value);
  }

  return values;
};

export const oneOf: Composeable = (...decoders: Array<Decoder<any>>) => async (
  value: any,
) => {
  for (const decoder of decoders) {
    try {
      await decoder(value);

      return value;
    } catch {}
  }

  throw new DecodeError("one of the provided decoders", typeof value);
};

export const nullable = <T>(decoder: Decoder<T>): Decoder<T | null> =>
  oneOf(nil, decoder);

export const maybe = <T>(decoder: Decoder<T>): Decoder<T | undefined> =>
  oneOf(
    simpleDecoder<undefined>("undefined", value => value === undefined),
    decoder,
  );

// TypeScript does not try to infer the subtype of functions parameters,
// Therefore a decoder like `union(str, "foo", "bar")` will result in a `Decoder<string>`
// The only way to prevent this is to provide the generics
// like `union<string, Array<'foo', 'bar'>>(str, 'foo', 'bar')`
export const union: Union = (decoder: Decoder<any>, ...values: Array<any>) =>
  compose(
    decoder,
    value => {
      if (!values.includes(value)) {
        return Promise.reject(new DecodeError(`${values.join(" or ")}`, value));
      }

      return Promise.resolve(value);
    },
  );

export const object = <T extends DecoderDict>(
  decoders: T,
): Decoder<DecoderValueDict<T>> => async (
  value,
): Promise<DecoderValueDict<T>> => {
  if (!isPlainObject(value)) {
    throw new DecodeError("object", typeof value);
  }

  for (const key in decoders) {
    await decoders[key](value[key]);
  }

  return value;
};

export const field = <T>(
  name: string,
  decoder: Decoder<T>,
): Decoder<T> => async (value): Promise<T> => await decoder(value[name]);

export const compose: Composeable = (
  ...decoders: Array<Decoder<any>>
) => async (value: any): Promise<any> => {
  for (const decoder of decoders) {
    await decoder(value);
  }

  return value;
};

export const map: Map = (
  f: (...values: Array<any>) => any,
  ...decoders: Array<Decoder<any>>
) => async (value: any) =>
  f(...(await Promise.all(decoders.map(decoder => decoder(value)))));
