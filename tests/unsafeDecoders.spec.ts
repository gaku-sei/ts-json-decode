import { decodeString } from "../src/index";
import {
  format,
  lengthWithin,
  max,
  maxLength,
  min,
  minLength,
  notEmpty,
  within,
} from "../src/unsafeDecoders";

describe("Unsafe decoders", () => {
  describe("decodeString", () => {
    describe("format", () => {
      it("should parse strings with a proper format and reject other values", () => {
        const decoder = format(/^[\w\d]+\@[\w\d]+\.\w{2,4}$/);

        expect(decodeString(decoder)('"foo@bar.com"')).toEqual("foo@bar.com");
        expect(decodeString(decoder, '"foo@bar.com"')).toEqual("foo@bar.com");

        expect(() => decodeString(decoder)('"foo"')).toThrow(Error);
        expect(() => decodeString(decoder)("42")).toThrow(Error);
        expect(() => decodeString(decoder)("true")).toThrow(Error);
        expect(() => decodeString(decoder)('["foo"]')).toThrow(Error);
        expect(() => decodeString(decoder)("null")).toThrow(Error);
        expect(() => decodeString(decoder, '"foo"')).toThrow(Error);
        expect(() => decodeString(decoder, "42")).toThrow(Error);
        expect(() => decodeString(decoder, "true")).toThrow(Error);
        expect(() => decodeString(decoder, '["foo"]')).toThrow(Error);
        expect(() => decodeString(decoder, "null")).toThrow(Error);
      });
    });

    describe("notEmpty", () => {
      it("should parse non empty and reject other values", () => {
        expect(decodeString(notEmpty)('"foo"')).toEqual("foo");
        expect(decodeString(notEmpty, '"foo"')).toEqual("foo");

        expect(() => decodeString(notEmpty)('""')).toThrow(Error);
        expect(() => decodeString(notEmpty)("42")).toThrow(Error);
        expect(() => decodeString(notEmpty)("true")).toThrow(Error);
        expect(() => decodeString(notEmpty)('["foo"]')).toThrow(Error);
        expect(() => decodeString(notEmpty)("null")).toThrow(Error);
        expect(() => decodeString(notEmpty, '""')).toThrow(Error);
        expect(() => decodeString(notEmpty, "42")).toThrow(Error);
        expect(() => decodeString(notEmpty, "true")).toThrow(Error);
        expect(() => decodeString(notEmpty, '["foo"]')).toThrow(Error);
        expect(() => decodeString(notEmpty, "null")).toThrow(Error);
      });
    });

    describe("within", () => {
      it("should parse numbers between 8 and 64 and reject other values", () => {
        const decoder = within(8, 64);

        expect(decodeString(decoder)("9")).toEqual(9);
        expect(decodeString(decoder)("63")).toEqual(63);
        expect(decodeString(decoder, "9")).toEqual(9);
        expect(decodeString(decoder, "63")).toEqual(63);

        expect(() => decodeString(decoder)("8")).toThrow(Error);
        expect(() => decodeString(decoder)("64")).toThrow(Error);
        expect(() => decodeString(decoder)('"foo"')).toThrow(Error);
        expect(() => decodeString(decoder)("true")).toThrow(Error);
        expect(() => decodeString(decoder)('["foo"]')).toThrow(Error);
        expect(() => decodeString(decoder)("null")).toThrow(Error);
        expect(() => decodeString(decoder, "8")).toThrow(Error);
        expect(() => decodeString(decoder, "64")).toThrow(Error);
        expect(() => decodeString(decoder, '"foo"')).toThrow(Error);
        expect(() => decodeString(decoder, "true")).toThrow(Error);
        expect(() => decodeString(decoder, '["foo"]')).toThrow(Error);
        expect(() => decodeString(decoder, "null")).toThrow(Error);
      });
    });

    describe("min", () => {
      it("should parse numbers greater than 8 and reject other values", () => {
        const decoder = min(8);

        expect(decodeString(decoder)("9")).toEqual(9);
        expect(decodeString(decoder)("10000")).toEqual(10000);
        expect(decodeString(decoder, "9")).toEqual(9);
        expect(decodeString(decoder, "10000")).toEqual(10000);

        expect(() => decodeString(decoder)("8")).toThrow(Error);
        expect(() => decodeString(decoder)('"foo"')).toThrow(Error);
        expect(() => decodeString(decoder)("true")).toThrow(Error);
        expect(() => decodeString(decoder)('["foo"]')).toThrow(Error);
        expect(() => decodeString(decoder)("null")).toThrow(Error);
        expect(() => decodeString(decoder, "8")).toThrow(Error);
        expect(() => decodeString(decoder, '"foo"')).toThrow(Error);
        expect(() => decodeString(decoder, "true")).toThrow(Error);
        expect(() => decodeString(decoder, '["foo"]')).toThrow(Error);
        expect(() => decodeString(decoder, "null")).toThrow(Error);
      });
    });

    describe("max", () => {
      it("should parse numbers lesser than 64 and reject other values", () => {
        const decoder = max(64);

        expect(decodeString(decoder)("63")).toEqual(63);
        expect(decodeString(decoder)("-10000")).toEqual(-10000);
        expect(decodeString(decoder, "63")).toEqual(63);
        expect(decodeString(decoder, "-10000")).toEqual(-10000);

        expect(() => decodeString(decoder)("64")).toThrow(Error);
        expect(() => decodeString(decoder)('"foo"')).toThrow(Error);
        expect(() => decodeString(decoder)("true")).toThrow(Error);
        expect(() => decodeString(decoder)('["foo"]')).toThrow(Error);
        expect(() => decodeString(decoder)("null")).toThrow(Error);
        expect(() => decodeString(decoder, "64")).toThrow(Error);
        expect(() => decodeString(decoder, '"foo"')).toThrow(Error);
        expect(() => decodeString(decoder, "true")).toThrow(Error);
        expect(() => decodeString(decoder, '["foo"]')).toThrow(Error);
        expect(() => decodeString(decoder, "null")).toThrow(Error);
      });
    });
  });

  describe("lengthWithin", () => {
    it("should parse strings with a length within 2 and 4 and reject other values", () => {
      const decoder = lengthWithin(2, 4);

      expect(decodeString(decoder)('"foo"')).toEqual("foo");
      expect(decodeString(decoder, '"foo"')).toEqual("foo");

      expect(() => decodeString(decoder)('""')).toThrow(Error);
      expect(() => decodeString(decoder)('"fo"')).toThrow(Error);
      expect(() => decodeString(decoder)('"fooo"')).toThrow(Error);
      expect(() => decodeString(decoder)('"super foobar"')).toThrow(Error);
      expect(() => decodeString(decoder)("8")).toThrow(Error);
      expect(() => decodeString(decoder)("true")).toThrow(Error);
      expect(() => decodeString(decoder)('["foo"]')).toThrow(Error);
      expect(() => decodeString(decoder)("null")).toThrow(Error);
      expect(() => decodeString(decoder, '""')).toThrow(Error);
      expect(() => decodeString(decoder, '"fo"')).toThrow(Error);
      expect(() => decodeString(decoder, '"fooo"')).toThrow(Error);
      expect(() => decodeString(decoder, '"super foobar"')).toThrow(Error);
      expect(() => decodeString(decoder, "8")).toThrow(Error);
      expect(() => decodeString(decoder, "true")).toThrow(Error);
      expect(() => decodeString(decoder, '["foo"]')).toThrow(Error);
      expect(() => decodeString(decoder, "null")).toThrow(Error);
    });
  });

  describe("minLength", () => {
    it("should parse strings with a length greater than 3 and reject other values", () => {
      const decoder = minLength(3);

      expect(decodeString(decoder)('"fooo"')).toEqual("fooo");
      expect(decodeString(decoder, '"fooo"')).toEqual("fooo");

      expect(() => decodeString(decoder)("8")).toThrow(Error);
      expect(() => decodeString(decoder)('"foo"')).toThrow(Error);
      expect(() => decodeString(decoder)("true")).toThrow(Error);
      expect(() => decodeString(decoder)('["foo"]')).toThrow(Error);
      expect(() => decodeString(decoder)("null")).toThrow(Error);
      expect(() => decodeString(decoder, "8")).toThrow(Error);
      expect(() => decodeString(decoder, '"foo"')).toThrow(Error);
      expect(() => decodeString(decoder, "true")).toThrow(Error);
      expect(() => decodeString(decoder, '["foo"]')).toThrow(Error);
      expect(() => decodeString(decoder, "null")).toThrow(Error);
    });
  });

  describe("maxLength", () => {
    it("should parse strings with a length lesser than 3 and reject other values", () => {
      const decoder = maxLength(3);

      expect(decodeString(decoder)('"fo"')).toEqual("fo");
      expect(decodeString(decoder, '"fo"')).toEqual("fo");

      expect(() => decodeString(decoder)("8")).toThrow(Error);
      expect(() => decodeString(decoder)('"foo"')).toThrow(Error);
      expect(() => decodeString(decoder)("true")).toThrow(Error);
      expect(() => decodeString(decoder)('["foo"]')).toThrow(Error);
      expect(() => decodeString(decoder)("null")).toThrow(Error);
      expect(() => decodeString(decoder, "8")).toThrow(Error);
      expect(() => decodeString(decoder, '"foo"')).toThrow(Error);
      expect(() => decodeString(decoder, "true")).toThrow(Error);
      expect(() => decodeString(decoder, '["foo"]')).toThrow(Error);
      expect(() => decodeString(decoder, "null")).toThrow(Error);
    });
  });
});
