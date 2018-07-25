// These decoders are strongly related to the concept of dependent typing
// https://en.wikipedia.org/wiki/Dependent_type
// Hopefully, this concept will one arrive in TypeScript
// https://github.com/Microsoft/TypeScript/pull/21316#issuecomment-360197486

import { Decoder, DecodeError, getAccurateTypeOf } from "./shared";

export const minLength = (length: number): Decoder<string> => value => {
  if (typeof value !== "string") {
    throw new DecodeError("string", getAccurateTypeOf(value));
  }

  if (value.length <= length) {
    throw new DecodeError(`string with a length greater than ${length}`, value);
  }

  return value;
};

export const maxLength = (length: number): Decoder<string> => value => {
  if (typeof value !== "string") {
    throw new DecodeError("string", getAccurateTypeOf(value));
  }

  if (value.length >= length) {
    throw new DecodeError(`string with a length lesser than ${length}`, value);
  }

  return value;
};

export const lengthWithin = (
  minLength: number,
  maxLength: number,
): Decoder<string> => value => {
  if (typeof value !== "string") {
    throw new DecodeError("string", getAccurateTypeOf(value));
  }

  if (value.length <= minLength || value.length >= maxLength) {
    throw new DecodeError(
      `string of length within ${minLength} and ${maxLength}`,
      typeof value,
    );
  }

  return value;
};

export const min = (minValue: number): Decoder<number> => value => {
  if (typeof value !== "number") {
    throw new DecodeError("number", getAccurateTypeOf(value));
  }

  if (value <= minValue) {
    throw new DecodeError(
      `number strictly greater than ${minValue}`,
      value.toString(),
    );
  }

  return value;
};

export const max = (maxValue: number): Decoder<number> => value => {
  if (typeof value !== "number") {
    throw new DecodeError("number", getAccurateTypeOf(value));
  }

  if (value >= maxValue) {
    throw new DecodeError(
      `number strictly lesser than ${maxValue}`,
      value.toString(),
    );
  }

  return value;
};

export const within = (
  minValue: number,
  maxValue: number,
): Decoder<number> => value => {
  if (typeof value !== "number") {
    throw new DecodeError("number", getAccurateTypeOf(value));
  }

  if (value <= minValue || value >= maxValue) {
    throw new DecodeError(
      `number strictly greater than ${minValue} and strictly lesser than ${maxValue}`,
      value.toString(),
    );
  }

  return value;
};

export const format = (pattern: RegExp): Decoder<string> => value => {
  if (typeof value !== "string" || !pattern.test(value)) {
    throw new DecodeError(`string matching ${pattern}`, value);
  }

  return value;
};

export const notEmpty: Decoder<string> = value => {
  if (typeof value !== "string") {
    throw new DecodeError("string", getAccurateTypeOf(value));
  }

  if (value.length === 0) {
    throw new DecodeError("non empty string", value);
  }

  return value;
};
