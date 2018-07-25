import { decodeString, decodeValue } from "../src/index";
import {
  array,
  bool,
  compose,
  field,
  map,
  maybe,
  nil,
  nullable,
  num,
  object,
  oneOf,
  str,
  union,
} from "../src/safeDecoders";

describe("Safe decoders", () => {
  describe("decodeString", () => {
    describe("str", () => {
      it("should parse strings and reject other values", () => {
        expect(decodeString(str)('"foo"')).toEqual("foo");

        expect(() => decodeString(str)("foo")).toThrow(Error);
        expect(() => decodeString(str)("42")).toThrow(Error);
        expect(() => decodeString(str)("true")).toThrow(Error);
        expect(() => decodeString(str)('["foo"]')).toThrow(Error);
        expect(() => decodeString(str)("null")).toThrow(Error);
      });
    });

    describe("num", () => {
      it("should parse numbers and reject other values", () => {
        expect(decodeString(num)("42")).toEqual(42);

        expect(() => decodeString(num)('"foo"')).toThrow(Error);
        expect(() => decodeString(num)("true")).toThrow(Error);
        expect(() => decodeString(num)('["foo"]')).toThrow(Error);
        expect(() => decodeString(str)("null")).toThrow(Error);
      });
    });

    describe("bool", () => {
      it("should parse booleans and reject other values", () => {
        expect(decodeString(bool)("true")).toEqual(true);

        expect(() => decodeString(bool)('"foo"')).toThrow(Error);
        expect(() => decodeString(bool)("42")).toThrow(Error);
        expect(() => decodeString(bool)('["foo"]')).toThrow(Error);
        expect(() => decodeString(str)("null")).toThrow(Error);
      });
    });

    describe("nil", () => {
      it("should parse nulls and reject other values", () => {
        expect(decodeString(nil)("null")).toEqual(null);

        expect(() => decodeString(nil)("true")).toThrow(Error);
        expect(() => decodeString(nil)('"foo"')).toThrow(Error);
        expect(() => decodeString(nil)("42")).toThrow(Error);
        expect(() => decodeString(nil)('["foo"]')).toThrow(Error);
      });
    });

    describe("array", () => {
      it("should parse shallow arrays and reject malformed ones", () => {
        expect(decodeString(array(str))("[]")).toEqual([]);
        expect(decodeString(array(str))('["foo", "bar"]')).toEqual([
          "foo",
          "bar",
        ]);

        expect(() => decodeString(array(str))("[null]")).toThrow(Error);
        expect(() => decodeString(array(str))('["foo", "bar", 42]')).toThrow(
          Error,
        );
        expect(() => decodeString(array(str))('["foo", "bar", true]')).toThrow(
          Error,
        );
      });

      it("should parse deep arrays and reject malformed ones", () => {
        expect(decodeString(array(array(num)))("[]")).toEqual([]);
        expect(decodeString(array(array(num)))("[[]]")).toEqual([[]]);
        expect(decodeString(array(array(num)))("[[42], [43]]")).toEqual([
          [42],
          [43],
        ]);

        expect(() => decodeString(array(array(num)))("[42, 43]")).toThrow(
          Error,
        );
        expect(() =>
          decodeString(array(array(num)))('[["foo"], ["bar"]]'),
        ).toThrow(Error);
      });
    });

    describe("maybe", () => {
      it("should parse undefined values and the provided decoder and reject the others", () => {
        const decoder = object({ foo: maybe(str) });

        expect(decodeString(decoder)("{}")).toEqual({});
        expect(decodeString(decoder)('{ "foo": "foo" }')).toEqual({
          foo: "foo",
        });

        expect(() => decodeString(maybe(str))("null")).toThrow(Error);
        expect(() => decodeString(maybe(str))("42")).toThrow(Error);
      });
    });

    describe("nullable", () => {
      it("should parse null values and the provided decoder and reject the others", () => {
        expect(decodeString(nullable(str))("null")).toEqual(null);
        expect(decodeString(nullable(str))('"foo"')).toEqual("foo");

        expect(() => decodeString(nullable(str))("undefined")).toThrow(Error);
        expect(() => decodeString(nullable(str))("42")).toThrow(Error);
      });
    });

    describe("oneOf", () => {
      it("should parse with only one of the two given decoders and reject the other ones", () => {
        const decoder = oneOf(str, num);

        expect(decodeString(decoder)("42")).toEqual(42);
        expect(decodeString(decoder)('"foo"')).toEqual("foo");

        expect(() => decodeString(decoder)("true")).toThrow(Error);
        expect(() => decodeString(decoder)("null")).toThrow(Error);
        expect(() => decodeString(decoder)("[]")).toThrow(Error);
      });

      it("should parse with only one of the three given decoders and reject the other ones", () => {
        const decoder = oneOf(str, num, array(bool));

        expect(decodeString(decoder)("42")).toEqual(42);
        expect(decodeString(decoder)('"foo"')).toEqual("foo");
        expect(decodeString(decoder)("[]")).toEqual([]);
        expect(decodeString(decoder)("[true]")).toEqual([true]);

        expect(() => decodeString(decoder)("true")).toThrow(Error);
        expect(() => decodeString(decoder)("null")).toThrow(Error);
        expect(() => decodeString(decoder)("[42, 43]")).toThrow(Error);
      });
    });

    describe("compose", () => {
      it("should compose the two provided decoders", () => {
        const decoder = compose(
          str,
          str,
        );

        expect(decodeString(decoder)('"foo"')).toEqual("foo");

        expect(() => decodeString(decoder)("42")).toThrow(Error);
      });

      it("should throw even if only one decoder fails", () => {
        const decoder = compose(
          str,
          str,
          str,
          str,
          num,
        );

        expect(() => decodeString(decoder)('"foo"')).toThrow(Error);
      });

      it("should handle as many decoders as needed (up to 10)", () => {
        const decoder = compose(
          nil,
          nullable(str),
          oneOf(nil, num),
        );

        expect(decodeString(decoder)("null")).toEqual(null);
        expect(() => decodeString(decoder)('"foo"')).toThrow(Error);
        expect(() => decodeString(decoder)("42")).toThrow(Error);
      });

      it("should support recursion", () => {
        const decoder = compose(
          nil,
          compose(
            nullable(str),
            oneOf(nil, num),
          ),
        );

        expect(decodeString(decoder)("null")).toEqual(null);
      });

      it("should allow decoder sequencing", () => {
        const phoneNumberDecoder = map(
          ({ center, left, right, ...props }) => ({
            phoneNumber: `${left}-${center}-${right}`,
            ...props,
          }),
          object({ center: str, left: str, right: str }),
        );

        const decoder = compose(
          phoneNumberDecoder,
          object({
            name: str,
            phoneNumber: str,
          }),
        );

        expect(
          decodeString(decoder)(
            '{"center": "0808", "left": "090", "name": "foobar", "right": "9878"}',
          ),
        ).toEqual({
          name: "foobar",
          phoneNumber: "090-0808-9878",
        });
      });
    });

    describe("map", () => {
      it("should create a new decoder, parsing input as string and transforming to number the output", () => {
        const decoder = map(({ length }) => length, str);

        expect(decodeString(decoder)('"foo"')).toEqual(3);

        expect(() => decodeString(decoder)("42")).toThrow(Error);
      });

      it("should handle several decoders", () => {
        const decoder = map(() => 1, str, str, str, str, str);

        expect(decodeString(decoder)('"foo"')).toEqual(1);

        expect(() => decodeString(decoder)("42")).toThrow(Error);
        expect(() => decodeString(decoder)("true")).toThrow(Error);
      });

      it("should throw even if only one decoder fails", () => {
        const decoder = map(() => null, str, str, str, str, num);

        expect(() => decodeString(decoder)('"foo"')).toThrow(Error);
      });

      it("should handle as many decoders as needed (up to 10)", () => {
        const decoder = map(
          (x, y, z) => ({ x, y, z }),
          nil,
          nullable(str),
          oneOf(nil, num),
        );

        expect(decodeString(decoder)("null")).toEqual({
          x: null,
          y: null,
          z: null,
        });

        expect(() => decodeString(decoder)('"foo"')).toThrow(Error);
        expect(() => decodeString(decoder)("42")).toThrow(Error);
      });

      it("should support recursion", () => {
        const decoder = map(
          x => ({ x }),
          map(x => x * 2, map(({ length }) => length, str)),
        );

        expect(decodeString(decoder)('"foo"')).toEqual({ x: 6 });
      });
    });

    describe("field", () => {
      it("should parse and extract the required field from object", () => {
        const decoder = field("x", num);

        expect(decodeString(decoder)('{ "x": 42 }')).toEqual(42);

        expect(() => decodeString(decoder)('{ "x": "foo" }')).toThrow(Error);
        expect(() => decodeString(decoder)('{ "y": 42 }')).toThrow(Error);
      });

      it("should support recursion", () => {
        const decoder = field("x", field("y", num));

        expect(decodeString(decoder)('{ "x": { "y": 42 } }')).toEqual(42);

        expect(() => decodeString(decoder)('{ "x": { "y": "foo" } }')).toThrow(
          Error,
        );
        expect(() => decodeString(decoder)('{ "y": { "x": 42 } }')).toThrow(
          Error,
        );
      });
    });

    describe("union", () => {
      it("should parse a simple union of two simple values", () => {
        const decoder = union<string, Array<"foo" | "bar">>(str, "foo", "bar");

        expect(decodeString(decoder)('"foo"')).toEqual("foo");
        expect(decodeString(decoder)('"bar"')).toEqual("bar");
        expect(() => decodeString(decoder)('"foobar"')).toThrow(Error);
        expect(() => decodeString(decoder)("42")).toThrow(Error);
        expect(() => decodeString(decoder)("null")).toThrow(Error);
      });

      it("should parse a simple union of ten simple values", () => {
        const decoder = union<
          number,
          Array<0 | 1 | 2 | 3 | 5 | 8 | 13 | 20 | 40 | 100>
        >(num, 0, 1, 2, 3, 5, 8, 13, 20, 40, 100);

        expect(decodeString(decoder)("0")).toEqual(0);
        expect(decodeString(decoder)("1")).toEqual(1);
        expect(decodeString(decoder)("2")).toEqual(2);
        expect(decodeString(decoder)("3")).toEqual(3);
        expect(decodeString(decoder)("5")).toEqual(5);
        expect(decodeString(decoder)("8")).toEqual(8);
        expect(decodeString(decoder)("13")).toEqual(13);
        expect(decodeString(decoder)("20")).toEqual(20);
        expect(decodeString(decoder)("40")).toEqual(40);
        expect(decodeString(decoder)("100")).toEqual(100);

        expect(() => decodeString(decoder)("42")).toThrow(Error);
        expect(() => decodeString(decoder)('"foobar"')).toThrow(Error);
        expect(() => decodeString(decoder)("null")).toThrow(Error);
      });
    });

    describe("object", () => {
      it("should parse a simple object according to the given decoders", () => {
        const decoder = object({
          foo: str,
          bar: num,
          baz: array(bool),
        });

        const input = `
          {
            "foo": "bar",
            "bar": 42,
            "baz": [true, false]
          }
        `;

        const wrongInput = `
          {
            "foo": "bar",
            "bar": "42",
            "baz": [true, false]
          }
        `;

        const expected = { foo: "bar", bar: 42, baz: [true, false] };

        expect(decodeString(decoder)(input)).toEqual(expected);

        expect(() => decodeString(decoder)(wrongInput)).toThrow(Error);
      });

      it("should parse a simple object according to the given decoders and allow extra attributes", () => {
        const decoder = object({
          foo: str,
          bar: num,
          baz: array(bool),
        });

        const input = `
          {
            "foo": "bar",
            "bar": 42,
            "baz": [true, false],
            "qux": true
          }
        `;

        const wrongInput = `
        {
          "foo": "bar",
          "bar": "42",
          "baz": [true, false],
          "qux": true
        }
      `;

        // The value is expected to be present at runtime
        // but won't be accessible at compile time
        const expected = { foo: "bar", bar: 42, baz: [true, false], qux: true };

        expect(decodeString(decoder)(input)).toEqual(expected);

        expect(() => decodeString(decoder)(wrongInput)).toThrow(Error);
      });

      it("should parse a complex object according to the given decoders", () => {
        const decoder = object({
          foo: str,
          bar: object({
            qux: array(nullable(bool)),
            quux: num,
          }),
          baz: array(bool),
        });

        const input = `
          {
            "foo": "bar",
            "bar": {
              "qux": [true, null, false],
              "quux": 42
            },
            "baz": [true, false]
          }
        `;

        const expected = {
          foo: "bar",
          bar: { qux: [true, null, false], quux: 42 },
          baz: [true, false],
        };

        const received = decodeString(decoder)(input);

        expect(received).toEqual(expected);
      });
    });

    describe("complex nested validators", () => {
      it("should pass the stress test", () => {
        const decoder = array(
          nullable(
            array(
              object({
                foo: nullable(num),
                bar: object({
                  baz: nullable(str),
                }),
              }),
            ),
          ),
        );

        const input = `
          [
            null,
            [
              {
                "foo": null,
                "bar": {
                  "baz": "foo"
                }
              },
              {
                "foo": 42,
                "bar": {
                  "baz": "bar"
                }
              },
              {
                "foo": 43,
                "bar": {
                  "baz": null
                }
              },
              {
                "foo": null,
                "bar": {
                  "baz": null
                }
              }
            ],
            null,
            [],
            null
          ]
        `;

        const expected = [
          null,
          [
            {
              foo: null,
              bar: {
                baz: "foo",
              },
            },
            {
              foo: 42,
              bar: {
                baz: "bar",
              },
            },
            {
              foo: 43,
              bar: {
                baz: null,
              },
            },
            {
              foo: null,
              bar: {
                baz: null,
              },
            },
          ],
          null,
          [],
          null,
        ];

        const received = decodeString(decoder)(input);

        expect(received).toEqual(expected);
      });
    });
  });

  describe("decodeValue", () => {
    describe("complex nested validators", () => {
      it("should pass the stress test", () => {
        const decoder = array(
          nullable(
            array(
              object({
                foo: nullable(num),
                bar: object({
                  baz: nullable(str),
                }),
              }),
            ),
          ),
        );

        const input = [
          null,
          [
            {
              foo: null,
              bar: {
                baz: "foo",
              },
            },
            {
              foo: 42,
              bar: {
                baz: "bar",
              },
            },
            {
              foo: 43,
              bar: {
                baz: null,
              },
            },
            {
              foo: null,
              bar: {
                baz: null,
              },
            },
          ],
          null,
          [],
          null,
        ];

        const received = decodeValue(decoder)(input);

        expect(received).toEqual(input);
      });
    });
  });
});
