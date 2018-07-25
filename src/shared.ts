export type Decoder<T> = (value: any) => T;

export interface DecoderDict {
  [key: string]: Decoder<any>;
}

export type DecoderValueDict<T extends DecoderDict> = {
  [K in keyof T]: T[K] extends Decoder<infer U> ? U : never
};

export class DecodeError extends Error {
  public expected!: string;
  public received!: string;

  constructor(expected: string, received: string) {
    super(`Expected ${expected} but got ${received}`);

    this.expected = expected;
    this.received = received;
  }
}

export function getAccurateTypeOf(x: any): string {
  const rawType: string = Object.prototype.toString.call(x);

  const matches = rawType.toLowerCase().match(/(\w+)/g);

  if (!matches || matches.length < 2) {
    return typeof x;
  }

  return matches[1];
}
