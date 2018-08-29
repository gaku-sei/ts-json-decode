import { Decoder, ParseError } from "./shared";

export * from "./safeDecoders";
export * from "./shared";
export * from "./unsafeDecoders";

export function decodeString<T>(decoder: Decoder<T>): (input: string) => T;
export function decodeString<T>(decoder: Decoder<T>, input: string): T;
export function decodeString<T>(decoder: Decoder<T>, input?: string) {
  const decode = (input: string) => {
    let json: unknown;

    try {
      json = JSON.parse(input);
    } catch {
      throw new ParseError(input);
    }

    return decoder(json);
  };

  if (typeof input !== "undefined") {
    return decode(input);
  }

  return decode;
}

export function decodeValue<T>(decoder: Decoder<T>): (input: any) => T;
export function decodeValue<T>(decoder: Decoder<T>, input: any): T;
export function decodeValue<T>(decoder: Decoder<T>, input?: any) {
  if (arguments.length === 2) {
    return decoder(input);
  }

  return decoder;
}
