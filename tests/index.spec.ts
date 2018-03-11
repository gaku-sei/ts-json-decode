import {
  array,
  bool,
  decodeString,
  compose,
  field,
  map,
  maybe,
  nil,
  num,
  nullable,
  object,
  oneOf,
  str,
  decodeValue,
} from "../src";

describe("Decoders", () => {
  describe("decodeString", () => {
    describe("str", () => {
      it("should parse strings and reject other values", async () => {
        await expect(decodeString(str)('"foo"')).resolves.toEqual("foo");

        await expect(decodeString(str)("foo")).rejects.toBeInstanceOf(Error);
        await expect(decodeString(str)("42")).rejects.toBeInstanceOf(Error);
        await expect(decodeString(str)("true")).rejects.toBeInstanceOf(Error);
        await expect(decodeString(str)('["foo"]')).rejects.toBeInstanceOf(
          Error,
        );
        await expect(decodeString(str)("null")).rejects.toBeInstanceOf(Error);
      });
    });

    describe("num", () => {
      it("should parse numbers and reject other values", async () => {
        await expect(decodeString(num)("42")).resolves.toEqual(42);

        await expect(decodeString(num)('"foo"')).rejects.toBeInstanceOf(Error);
        await expect(decodeString(num)("true")).rejects.toBeInstanceOf(Error);
        await expect(decodeString(num)('["foo"]')).rejects.toBeInstanceOf(
          Error,
        );
        await expect(decodeString(str)("null")).rejects.toBeInstanceOf(Error);
      });
    });

    describe("bool", () => {
      it("should parse booleans and reject other values", async () => {
        await expect(decodeString(bool)("true")).resolves.toEqual(true);

        await expect(decodeString(bool)('"foo"')).rejects.toBeInstanceOf(Error);
        await expect(decodeString(bool)("42")).rejects.toBeInstanceOf(Error);
        await expect(decodeString(bool)('["foo"]')).rejects.toBeInstanceOf(
          Error,
        );
        await expect(decodeString(str)("null")).rejects.toBeInstanceOf(Error);
      });
    });

    describe("nil", () => {
      it("should parse nulls and reject other values", async () => {
        await expect(decodeString(nil)("null")).resolves.toEqual(null);

        // await expect(decode(nil, "true")).rejects.toBeInstanceOf(Error);
        // await expect(decode(nil, '"foo"')).rejects.toBeInstanceOf(Error);
        // await expect(decode(nil, "42")).rejects.toBeInstanceOf(Error);
        // await expect(decode(nil, '["foo"]')).rejects.toBeInstanceOf(Error);
      });
    });

    describe("array", () => {
      it("should parse shallow arrays and reject malformed ones", async () => {
        await expect(decodeString(array(str))("[]")).resolves.toEqual([]);
        await expect(
          decodeString(array(str))('["foo", "bar"]'),
        ).resolves.toEqual(["foo", "bar"]);

        await expect(decodeString(array(str))("[null]")).rejects.toBeInstanceOf(
          Error,
        );
        await expect(
          decodeString(array(str))('["foo", "bar", 42]'),
        ).rejects.toBeInstanceOf(Error);
        await expect(
          decodeString(array(str))('["foo", "bar", true]'),
        ).rejects.toBeInstanceOf(Error);
      });

      it("should parse deep arrays and reject malformed ones", async () => {
        await expect(decodeString(array(array(num)))("[]")).resolves.toEqual(
          [],
        );
        await expect(decodeString(array(array(num)))("[[]]")).resolves.toEqual([
          [],
        ]);
        await expect(
          decodeString(array(array(num)))("[[42], [43]]"),
        ).resolves.toEqual([[42], [43]]);

        await expect(
          decodeString(array(array(num)))("[42, 43]"),
        ).rejects.toBeInstanceOf(Error);
        await expect(
          decodeString(array(array(num)))('[["foo"], ["bar"]]'),
        ).rejects.toBeInstanceOf(Error);
      });
    });

    describe("maybe", () => {
      it("should parse undefined values and the provided decoder and reject the others", async () => {
        const decoder = object({ foo: maybe(str) });

        await expect(decodeString(decoder)("{}")).resolves.toEqual({});
        await expect(
          decodeString(decoder)('{ "foo": "foo" }'),
        ).resolves.toEqual({
          foo: "foo",
        });

        await expect(decodeString(maybe(str))("null")).rejects.toBeInstanceOf(
          Error,
        );
        await expect(decodeString(maybe(str))("42")).rejects.toBeInstanceOf(
          Error,
        );
      });
    });

    describe("nullable", () => {
      it("should parse null values and the provided decoder and reject the others", async () => {
        await expect(decodeString(nullable(str))("null")).resolves.toEqual(
          null,
        );
        await expect(decodeString(nullable(str))('"foo"')).resolves.toEqual(
          "foo",
        );

        await expect(
          decodeString(nullable(str))("undefined"),
        ).rejects.toBeInstanceOf(Error);
        await expect(decodeString(nullable(str))("42")).rejects.toBeInstanceOf(
          Error,
        );
      });
    });

    describe("oneOf", () => {
      it("should parse with only one of the two given decoders and reject the other ones", async () => {
        const decoder = oneOf(str, num);

        await expect(decodeString(decoder)("42")).resolves.toEqual(42);
        await expect(decodeString(decoder)('"foo"')).resolves.toEqual("foo");

        await expect(decodeString(decoder)("true")).rejects.toBeInstanceOf(
          Error,
        );
        await expect(decodeString(decoder)("null")).rejects.toBeInstanceOf(
          Error,
        );
        await expect(decodeString(decoder)("[]")).rejects.toBeInstanceOf(Error);
      });

      it("should parse with only one of the three given decoders and reject the other ones", async () => {
        const decoder = oneOf(str, num, array(bool));

        await expect(decodeString(decoder)("42")).resolves.toEqual(42);
        await expect(decodeString(decoder)('"foo"')).resolves.toEqual("foo");
        await expect(decodeString(decoder)("[]")).resolves.toEqual([]);
        await expect(decodeString(decoder)("[true]")).resolves.toEqual([true]);

        await expect(decodeString(decoder)("true")).rejects.toBeInstanceOf(
          Error,
        );
        await expect(decodeString(decoder)("null")).rejects.toBeInstanceOf(
          Error,
        );
        await expect(decodeString(decoder)("[42, 43]")).rejects.toBeInstanceOf(
          Error,
        );
      });
    });

    describe("compose", () => {
      it("should compose the two provided decoders", async () => {
        const decoder = compose(str, str);

        await expect(decodeString(decoder)('"foo"')).resolves.toEqual("foo");

        await expect(decodeString(decoder)("42")).rejects.toBeInstanceOf(Error);
      });

      it("should throw even if only one decoder fails", async () => {
        const decoder = compose(str, str, str, str, num);

        await expect(decodeString(decoder)('"foo"')).rejects.toBeInstanceOf(
          Error,
        );
      });

      it("should handle as many decoders as needed (up to 10)", async () => {
        const decoder = compose(nil, nullable(str), oneOf(nil, num));

        await expect(decodeString(decoder)("null")).resolves.toEqual(null);
        await expect(decodeString(decoder)('"foo"')).rejects.toBeInstanceOf(
          Error,
        );
        await expect(decodeString(decoder)("42")).rejects.toBeInstanceOf(Error);
      });

      it("should support recursion", async () => {
        const decoder = compose(nil, compose(nullable(str), oneOf(nil, num)));

        await expect(decodeString(decoder)("null")).resolves.toEqual(null);
      });
    });

    describe("map", () => {
      it("should create a new decoder, parsing input as string and transforming to number the output", async () => {
        const decoder = map(({ length }) => length, str);

        await expect(decodeString(decoder)('"foo"')).resolves.toEqual(3);

        await expect(decodeString(decoder)("42")).rejects.toBeInstanceOf(Error);
      });

      it("should handle several decoders", async () => {
        const decoder = map(() => 1, str, str, str, str, str);

        await expect(decodeString(decoder)('"foo"')).resolves.toEqual(1);

        await expect(decodeString(decoder)("42")).rejects.toBeInstanceOf(Error);
        await expect(decodeString(decoder)("true")).rejects.toBeInstanceOf(
          Error,
        );
      });

      it("should throw even if only one decoder fails", async () => {
        const decoder = map(() => null, str, str, str, str, num);

        await expect(decodeString(decoder)('"foo"')).rejects.toBeInstanceOf(
          Error,
        );
      });

      it("should handle as many decoders as needed (up to 10)", async () => {
        const decoder = map(
          (x, y, z) => ({ x, y, z }),
          nil,
          nullable(str),
          oneOf(nil, num),
        );

        await expect(decodeString(decoder)("null")).resolves.toEqual({
          x: null,
          y: null,
          z: null,
        });

        await expect(decodeString(decoder)('"foo"')).rejects.toBeInstanceOf(
          Error,
        );
        await expect(decodeString(decoder)("42")).rejects.toBeInstanceOf(Error);
      });

      it("should support recursion", async () => {
        const decoder = map(
          x => ({ x }),
          map(x => x * 2, map(({ length }) => length, str)),
        );

        await expect(decodeString(decoder)('"foo"')).resolves.toEqual({ x: 6 });
      });
    });

    describe("field", () => {
      it("should parse and extract the required field from object", async () => {
        const decoder = field("x", num);

        await expect(decodeString(decoder)('{ "x": 42 }')).resolves.toEqual(42);

        await expect(
          decodeString(decoder)('{ "x": "foo" }'),
        ).rejects.toBeInstanceOf(Error);
        await expect(
          decodeString(decoder)('{ "y": 42 }'),
        ).rejects.toBeInstanceOf(Error);
      });

      it("should support recursion", async () => {
        const decoder = field("x", field("y", num));

        await expect(
          decodeString(decoder)('{ "x": { "y": 42 } }'),
        ).resolves.toEqual(42);

        await expect(
          decodeString(decoder)('{ "x": { "y": "foo" } }'),
        ).rejects.toBeInstanceOf(Error);
        await expect(
          decodeString(decoder)('{ "y": { "x": 42 } }'),
        ).rejects.toBeInstanceOf(Error);
      });
    });

    describe("object", () => {
      it("should parse a simple object according to the given decoders", async () => {
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

        const expected = { foo: "bar", bar: 42, baz: [true, false] };

        const received = decodeString(decoder)(input);

        await expect(received).resolves.toEqual(expected);
      });

      it("should parse a simple object according to the given decoders and allow extra attributes", async () => {
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

        // The value is expected to be present at runtime
        // but won't be accessible at compile time
        const expected = { foo: "bar", bar: 42, baz: [true, false], qux: true };

        const received = decodeString(decoder)(input);

        await expect(received).resolves.toEqual(expected);
      });

      it("should parse a complex object according to the given decoders", async () => {
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

        await expect(received).resolves.toEqual(expected);
      });
    });

    describe("complex nested validators", () => {
      it("should pass the stress test", async () => {
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

        await expect(received).resolves.toEqual(expected);
      });
    });
  });

  describe("decodeValue", () => {
    describe("complex nested validators", () => {
      it("should pass the stress test", async () => {
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

        await expect(received).resolves.toEqual(input);
      });
    });
  });
});
