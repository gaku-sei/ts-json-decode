import { Decoder } from "./shared";

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
      throw new Error(`Could not parse input: ${input}`);
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
  if (typeof input !== "undefined") {
    return decoder(input);
  }

  return decoder;
}
