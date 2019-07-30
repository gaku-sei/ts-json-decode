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

    Object.setPrototypeOf(this, DecodeError.prototype);

    this.expected = expected;
    this.received = received;
  }
}

export class ParseError extends Error {
  public input!: string;

  constructor(input: string) {
    super(`Could not parse input: ${input}`);

    Object.setPrototypeOf(this, ParseError.prototype);

    this.input = input;
  }
}

export function getAccurateTypeOf(value: any): string {
  const rawType: string = Object.prototype.toString.call(value);

  const matches = rawType.toLowerCase().match(/(\w+)/g);

  if (!matches || matches.length < 2) {
    return typeof value;
  }

  return matches[1];
}

// "Safe" alternative to the hasOwnProperty method
export function hasOwnProperty(value: any, key: string): boolean {
  try {
    return Object.prototype.hasOwnProperty.call(value, key);
  } catch {
    return false;
  }
}
