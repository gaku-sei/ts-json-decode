import { decodeString } from "../src/index";
import {
  format,
  int,
  lengthWithin,
  max,
  maxLength,
  min,
  minLength,
  notEmpty,
  within,
} from "../src/unsafeDecoders";
import { DecodeError } from "../src/shared";

describe("Unsafe decoders", () => {
  describe("decodeString", () => {
    describe("format", () => {
      it("should parse strings with a proper format and reject other values", () => {
        const decoder = format(/^[\w\d]+\@[\w\d]+\.\w{2,4}$/);

        expect(decodeString(decoder)('"foo@bar.com"')).toEqual("foo@bar.com");
        expect(decodeString(decoder, '"foo@bar.com"')).toEqual("foo@bar.com");

        expect(() => decodeString(decoder)('"foo"')).toThrow(DecodeError);
        expect(() => decodeString(decoder)("42")).toThrow(DecodeError);
        expect(() => decodeString(decoder)("true")).toThrow(DecodeError);
        expect(() => decodeString(decoder)('["foo"]')).toThrow(DecodeError);
        expect(() => decodeString(decoder)("null")).toThrow(DecodeError);
        expect(() => decodeString(decoder, '"foo"')).toThrow(DecodeError);
        expect(() => decodeString(decoder, "42")).toThrow(DecodeError);
        expect(() => decodeString(decoder, "true")).toThrow(DecodeError);
        expect(() => decodeString(decoder, '["foo"]')).toThrow(DecodeError);
        expect(() => decodeString(decoder, "null")).toThrow(DecodeError);
      });
    });

    describe("notEmpty", () => {
      it("should parse non empty and reject other values", () => {
        expect(decodeString(notEmpty)('"foo"')).toEqual("foo");
        expect(decodeString(notEmpty, '"foo"')).toEqual("foo");

        expect(() => decodeString(notEmpty)('""')).toThrow(DecodeError);
        expect(() => decodeString(notEmpty)("42")).toThrow(DecodeError);
        expect(() => decodeString(notEmpty)("true")).toThrow(DecodeError);
        expect(() => decodeString(notEmpty)('["foo"]')).toThrow(DecodeError);
        expect(() => decodeString(notEmpty)("null")).toThrow(DecodeError);
        expect(() => decodeString(notEmpty, '""')).toThrow(DecodeError);
        expect(() => decodeString(notEmpty, "42")).toThrow(DecodeError);
        expect(() => decodeString(notEmpty, "true")).toThrow(DecodeError);
        expect(() => decodeString(notEmpty, '["foo"]')).toThrow(DecodeError);
        expect(() => decodeString(notEmpty, "null")).toThrow(DecodeError);
      });
    });

    describe("within", () => {
      it("should parse numbers between 8 and 64 and reject other values", () => {
        const decoder = within(8, 64);

        expect(decodeString(decoder)("9")).toEqual(9);
        expect(decodeString(decoder)("63")).toEqual(63);
        expect(decodeString(decoder, "9")).toEqual(9);
        expect(decodeString(decoder, "63")).toEqual(63);

        expect(() => decodeString(decoder)("8")).toThrow(DecodeError);
        expect(() => decodeString(decoder)("64")).toThrow(DecodeError);
        expect(() => decodeString(decoder)('"foo"')).toThrow(DecodeError);
        expect(() => decodeString(decoder)("true")).toThrow(DecodeError);
        expect(() => decodeString(decoder)('["foo"]')).toThrow(DecodeError);
        expect(() => decodeString(decoder)("null")).toThrow(DecodeError);
        expect(() => decodeString(decoder, "8")).toThrow(DecodeError);
        expect(() => decodeString(decoder, "64")).toThrow(DecodeError);
        expect(() => decodeString(decoder, '"foo"')).toThrow(DecodeError);
        expect(() => decodeString(decoder, "true")).toThrow(DecodeError);
        expect(() => decodeString(decoder, '["foo"]')).toThrow(DecodeError);
        expect(() => decodeString(decoder, "null")).toThrow(DecodeError);
      });
    });

    describe("min", () => {
      it("should parse numbers greater than 8 and reject other values", () => {
        const decoder = min(8);

        expect(decodeString(decoder)("9")).toEqual(9);
        expect(decodeString(decoder)("10000")).toEqual(10000);
        expect(decodeString(decoder, "9")).toEqual(9);
        expect(decodeString(decoder, "10000")).toEqual(10000);

        expect(() => decodeString(decoder)("8")).toThrow(DecodeError);
        expect(() => decodeString(decoder)('"foo"')).toThrow(DecodeError);
        expect(() => decodeString(decoder)("true")).toThrow(DecodeError);
        expect(() => decodeString(decoder)('["foo"]')).toThrow(DecodeError);
        expect(() => decodeString(decoder)("null")).toThrow(DecodeError);
        expect(() => decodeString(decoder, "8")).toThrow(DecodeError);
        expect(() => decodeString(decoder, '"foo"')).toThrow(DecodeError);
        expect(() => decodeString(decoder, "true")).toThrow(DecodeError);
        expect(() => decodeString(decoder, '["foo"]')).toThrow(DecodeError);
        expect(() => decodeString(decoder, "null")).toThrow(DecodeError);
      });
    });

    describe("max", () => {
      it("should parse numbers lesser than 64 and reject other values", () => {
        const decoder = max(64);

        expect(decodeString(decoder)("63")).toEqual(63);
        expect(decodeString(decoder)("-10000")).toEqual(-10000);
        expect(decodeString(decoder, "63")).toEqual(63);
        expect(decodeString(decoder, "-10000")).toEqual(-10000);

        expect(() => decodeString(decoder)("64")).toThrow(DecodeError);
        expect(() => decodeString(decoder)('"foo"')).toThrow(DecodeError);
        expect(() => decodeString(decoder)("true")).toThrow(DecodeError);
        expect(() => decodeString(decoder)('["foo"]')).toThrow(DecodeError);
        expect(() => decodeString(decoder)("null")).toThrow(DecodeError);
        expect(() => decodeString(decoder, "64")).toThrow(DecodeError);
        expect(() => decodeString(decoder, '"foo"')).toThrow(DecodeError);
        expect(() => decodeString(decoder, "true")).toThrow(DecodeError);
        expect(() => decodeString(decoder, '["foo"]')).toThrow(DecodeError);
        expect(() => decodeString(decoder, "null")).toThrow(DecodeError);
      });
    });
  });

  describe("lengthWithin", () => {
    it("should parse strings with a length within 2 and 4 and reject other values", () => {
      const decoder = lengthWithin(2, 4);

      expect(decodeString(decoder)('"foo"')).toEqual("foo");
      expect(decodeString(decoder, '"foo"')).toEqual("foo");

      expect(() => decodeString(decoder)('""')).toThrow(DecodeError);
      expect(() => decodeString(decoder)('"fo"')).toThrow(DecodeError);
      expect(() => decodeString(decoder)('"fooo"')).toThrow(DecodeError);
      expect(() => decodeString(decoder)('"super foobar"')).toThrow(
        DecodeError,
      );
      expect(() => decodeString(decoder)("8")).toThrow(DecodeError);
      expect(() => decodeString(decoder)("true")).toThrow(DecodeError);
      expect(() => decodeString(decoder)('["foo"]')).toThrow(DecodeError);
      expect(() => decodeString(decoder)("null")).toThrow(DecodeError);
      expect(() => decodeString(decoder, '""')).toThrow(DecodeError);
      expect(() => decodeString(decoder, '"fo"')).toThrow(DecodeError);
      expect(() => decodeString(decoder, '"fooo"')).toThrow(DecodeError);
      expect(() => decodeString(decoder, '"super foobar"')).toThrow(
        DecodeError,
      );
      expect(() => decodeString(decoder, "8")).toThrow(DecodeError);
      expect(() => decodeString(decoder, "true")).toThrow(DecodeError);
      expect(() => decodeString(decoder, '["foo"]')).toThrow(DecodeError);
      expect(() => decodeString(decoder, "null")).toThrow(DecodeError);
    });
  });

  describe("minLength", () => {
    it("should parse strings with a length greater than 3 and reject other values", () => {
      const decoder = minLength(3);

      expect(decodeString(decoder)('"fooo"')).toEqual("fooo");
      expect(decodeString(decoder, '"fooo"')).toEqual("fooo");

      expect(() => decodeString(decoder)("8")).toThrow(DecodeError);
      expect(() => decodeString(decoder)('"foo"')).toThrow(DecodeError);
      expect(() => decodeString(decoder)("true")).toThrow(DecodeError);
      expect(() => decodeString(decoder)('["foo"]')).toThrow(DecodeError);
      expect(() => decodeString(decoder)("null")).toThrow(DecodeError);
      expect(() => decodeString(decoder, "8")).toThrow(DecodeError);
      expect(() => decodeString(decoder, '"foo"')).toThrow(DecodeError);
      expect(() => decodeString(decoder, "true")).toThrow(DecodeError);
      expect(() => decodeString(decoder, '["foo"]')).toThrow(DecodeError);
      expect(() => decodeString(decoder, "null")).toThrow(DecodeError);
    });
  });

  describe("maxLength", () => {
    it("should parse strings with a length lesser than 3 and reject other values", () => {
      const decoder = maxLength(3);

      expect(decodeString(decoder)('"fo"')).toEqual("fo");
      expect(decodeString(decoder, '"fo"')).toEqual("fo");

      expect(() => decodeString(decoder)("8")).toThrow(DecodeError);
      expect(() => decodeString(decoder)('"foo"')).toThrow(DecodeError);
      expect(() => decodeString(decoder)("true")).toThrow(DecodeError);
      expect(() => decodeString(decoder)('["foo"]')).toThrow(DecodeError);
      expect(() => decodeString(decoder)("null")).toThrow(DecodeError);
      expect(() => decodeString(decoder, "8")).toThrow(DecodeError);
      expect(() => decodeString(decoder, '"foo"')).toThrow(DecodeError);
      expect(() => decodeString(decoder, "true")).toThrow(DecodeError);
      expect(() => decodeString(decoder, '["foo"]')).toThrow(DecodeError);
      expect(() => decodeString(decoder, "null")).toThrow(DecodeError);
    });
  });

  describe("maxLength", () => {
    it("should parse integers and reject other values", () => {
      expect(decodeString(int)("-100")).toEqual(-100);
      expect(decodeString(int)("0")).toEqual(0);
      expect(decodeString(int)("8")).toEqual(8);
      expect(decodeString(int)("5.0")).toEqual(5.0);
      expect(decodeString(int, "-100")).toEqual(-100);
      expect(decodeString(int, "0")).toEqual(0);
      expect(decodeString(int, "8")).toEqual(8);
      expect(decodeString(int, "5.0")).toEqual(5.0);

      expect(() => decodeString(int)("8.1")).toThrow(DecodeError);
      expect(() => decodeString(int)('"foo"')).toThrow(DecodeError);
      expect(() => decodeString(int)("true")).toThrow(DecodeError);
      expect(() => decodeString(int)("[1]")).toThrow(DecodeError);
      expect(() => decodeString(int)("null")).toThrow(DecodeError);
      expect(() => decodeString(int, "8.1")).toThrow(DecodeError);
      expect(() => decodeString(int, '"foo"')).toThrow(DecodeError);
      expect(() => decodeString(int, "true")).toThrow(DecodeError);
      expect(() => decodeString(int, "[1]")).toThrow(DecodeError);
      expect(() => decodeString(int, "null")).toThrow(DecodeError);
    });
  });
});
