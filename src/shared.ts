export type Decoder<T> = (value: any) => T;

export interface DecoderDict {
  [key: string]: Decoder<any>;
}

export type DecoderValueDict<T extends DecoderDict> = {
  [K in keyof T]: T[K] extends Decoder<infer U> ? U : never
};

export class DecodeError extends Error {
  constructor(expected: string, received: string) {
    super(`Expected ${expected} but got ${received}`);
  }
}
