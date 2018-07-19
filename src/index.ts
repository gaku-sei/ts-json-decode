import { Decoder } from "./shared";

export * from "./safeDecoders";
export * from "./shared";
export * from "./unsafeDecoders";

export const decodeString = <T>(decoder: Decoder<T>) => (input: string): T => {
  let json: any;

  try {
    json = JSON.parse(input);
  } catch {
    throw new Error(`Could not parse input: ${input}`);
  }

  return decoder(json);
};

export const decodeValue = <T>(decoder: Decoder<T>) => (input: any): T =>
  decoder(input);
