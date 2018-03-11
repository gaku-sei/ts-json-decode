export type DecoderFunction<T> = (input: string) => Promise<T>;
export type ValidateFunction<T> = (value: any) => value is T;

export interface Decoder<T> {
  readonly decode: DecoderFunction<T>;
  readonly validate: ValidateFunction<T>;
  // For the moment the following creates a type hole
  // if the end user tries to acces this hollow property
  // since the value it refers to is always null.
  // Should be fixed by https://github.com/Microsoft/TypeScript/pull/21316
  readonly "": T;
}

// Please... https://github.com/Microsoft/TypeScript/issues/5453
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
}

export interface DecoderDict {
  [key: string]: Decoder<any>;
}

export type DecoderValueDict<T extends DecoderDict> = {
  [K in keyof T]: T[K][""]
};

export const decode = <T>(decoder: Decoder<T>, input: string): Promise<T> =>
  decoder.decode(input);

const isPlainObject = (value: any): boolean => {
  if (typeof value !== "object") {
    return false;
  }

  if (Object.prototype.toString.call(value) !== "[object Object]") {
    return false;
  }

  return true;
};

const createDecoder = <T>(validate: ValidateFunction<T>): Decoder<T> => ({
  // Here is the hacky value
  "": null as never,
  decode: input =>
    new Promise((resolve, reject) => {
      try {
        const output = JSON.parse(input);

        if (!validate(output)) {
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
    }),
  validate,
});

export const str: Decoder<string> = createDecoder(function(
  value,
): value is string {
  return typeof value === "string";
});

export const num: Decoder<number> = createDecoder(function(
  value,
): value is number {
  return typeof value === "number";
});

export const bool: Decoder<boolean> = createDecoder(function(
  value,
): value is boolean {
  return typeof value === "boolean";
});

export const nil: Decoder<null> = createDecoder(function(value): value is null {
  return value === null;
});

export const array = <T>(decoder: Decoder<T>): Decoder<Array<T>> =>
  createDecoder(function(value): value is Array<T> {
    if (!Array.isArray(value)) {
      return false;
    }

    return !value.some(v => !decoder.validate(v));
  });

export const oneOf: OneOf = (...decoders: Array<Decoder<any>>) =>
  createDecoder(function(value): value is any {
    return decoders.some(decoder => decoder.validate(value));
  });

export const nullable = <T>(decoder: Decoder<T>): Decoder<T | null> =>
  oneOf(nil, decoder);

export const object = <T extends DecoderDict>(
  decoders: T,
): Decoder<DecoderValueDict<T>> =>
  createDecoder(function(value): value is DecoderValueDict<T> {
    if (!isPlainObject(value)) {
      return false;
    }

    for (const key in decoders) {
      if (!(key in value) || !decoders[key].validate(value[key])) {
        return false;
      }
    }

    return true;
  });
