export type DecoderFunction<T> = (input: string) => Promise<T>;
export type ValidateFunction = (value: any) => boolean;

export interface Decoder<T> {
  readonly decode: DecoderFunction<T>;
  readonly validate: ValidateFunction;
  // For the moment the following creates a type hole
  // if the end user tries to acces this hollow property
  // since the value it refers to is always null.
  // Should be fixed by https://github.com/Microsoft/TypeScript/pull/21316
  readonly "": T;
}

export interface OneOf {
  <T, U>(decoder1: Decoder<T>, decoder2: Decoder<U>): Decoder<T | U>;
  <T, U, V>(
    decoder1: Decoder<T>,
    decoder2: Decoder<U>,
    decoder3: Decoder<V>
  ): Decoder<T | U | V>;
  <T, U, V, W>(
    decoder1: Decoder<T>,
    decoder2: Decoder<U>,
    decoder3: Decoder<V>,
    decoder4: Decoder<W>
  ): Decoder<T | U | V | W>;
  <T, U, V, W, X>(
    decoder1: Decoder<T>,
    decoder2: Decoder<U>,
    decoder3: Decoder<V>,
    decoder4: Decoder<W>,
    decoder5: Decoder<X>
  ): Decoder<T | U | V | W | X>;
  <T, U, V, W, X, Y>(
    decoder1: Decoder<T>,
    decoder2: Decoder<U>,
    decoder3: Decoder<V>,
    decoder4: Decoder<W>,
    decoder5: Decoder<X>,
    decoder6: Decoder<Y>
  ): Decoder<T | U | V | W | X | Y>;
  <T, U, V, W, X, Y, Z>(
    decoder1: Decoder<T>,
    decoder2: Decoder<U>,
    decoder3: Decoder<V>,
    decoder4: Decoder<W>,
    decoder5: Decoder<X>,
    decoder6: Decoder<Y>,
    decoder7: Decoder<Z>
  ): Decoder<T | U | V | W | X | Y | Z>;
}

export interface DecoderDict {
  [key: string]: Decoder<any>;
}

export type DecoderValueDict<T extends DecoderDict> = {
  [K in keyof T]: T[K][""]
};

export const decodeString = <T>(
  decoder: Decoder<T>,
  input: string
): Promise<T> => decoder.decode(input);

const createDecoder = <T>(validate: ValidateFunction): Decoder<T> => ({
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
                2
              )} is not valid`
            )
          );
        }

        resolve(output);
      } catch {
        reject(new Error(`Could not parse input: ${input}`));
      }
    }),
  validate
});

export const str: Decoder<string> = createDecoder(
  value => typeof value === "string"
);

export const num: Decoder<number> = createDecoder(
  value => typeof value === "number"
);

export const bool: Decoder<boolean> = createDecoder(
  value => typeof value === "boolean"
);

export const nil: Decoder<boolean> = createDecoder(value => value === null);

export const array = <T>(decoder: Decoder<T>): Decoder<Array<T>> =>
  createDecoder(value => {
    if (!Array.isArray(value)) {
      return false;
    }

    if (value.some(v => !decoder.validate(v))) {
      return false;
    }

    return true;
  });

export const nullable = <T>(decoder: Decoder<T>): Decoder<T | null> =>
  createDecoder(value => value === null || decoder.validate(value));

export const oneOf: OneOf = (...decoders: Array<Decoder<any>>) =>
  createDecoder(value => decoders.some(decoder => decoder.validate(value)));

export const object = <T extends DecoderDict>(
  decoders: T
): Decoder<DecoderValueDict<T>> =>
  createDecoder(value => {
    if (Object.prototype.toString.call(value) !== "[object Object]") {
      return false;
    }

    for (const key in decoders) {
      if (!(key in value)) {
        return false;
      }

      if (!decoders[key].validate(value[key])) {
        return false;
      }
    }

    return true;
  });
