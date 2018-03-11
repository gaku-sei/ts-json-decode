import {
  array,
  bool,
  decode,
  compose,
  maybe,
  nil,
  num,
  nullable,
  object,
  oneOf,
  str,
} from "../src";

describe("Decoders", () => {
  describe("decodeString", () => {
    describe("str", () => {
      it("should parse strings and reject other values", async () => {
        await expect(decode(str, '"foo"')).resolves.toEqual("foo");

        await expect(decode(str, "foo")).rejects.toBeInstanceOf(Error);
        await expect(decode(str, "42")).rejects.toBeInstanceOf(Error);
        await expect(decode(str, "true")).rejects.toBeInstanceOf(Error);
        await expect(decode(str, '["foo"]')).rejects.toBeInstanceOf(Error);
        await expect(decode(str, "null")).rejects.toBeInstanceOf(Error);
      });
    });

    describe("num", () => {
      it("should parse numbers and reject other values", async () => {
        await expect(decode(num, "42")).resolves.toEqual(42);

        await expect(decode(num, '"foo"')).rejects.toBeInstanceOf(Error);
        await expect(decode(num, "true")).rejects.toBeInstanceOf(Error);
        await expect(decode(num, '["foo"]')).rejects.toBeInstanceOf(Error);
        await expect(decode(str, "null")).rejects.toBeInstanceOf(Error);
      });
    });

    describe("bool", () => {
      it("should parse booleans and reject other values", async () => {
        await expect(decode(bool, "true")).resolves.toEqual(true);

        await expect(decode(bool, '"foo"')).rejects.toBeInstanceOf(Error);
        await expect(decode(bool, "42")).rejects.toBeInstanceOf(Error);
        await expect(decode(bool, '["foo"]')).rejects.toBeInstanceOf(Error);
        await expect(decode(str, "null")).rejects.toBeInstanceOf(Error);
      });
    });

    describe("nil", () => {
      it("should parse nulls and reject other values", async () => {
        await expect(decode(nil, "null")).resolves.toEqual(null);

        await expect(decode(nil, "true")).rejects.toBeInstanceOf(Error);
        await expect(decode(nil, '"foo"')).rejects.toBeInstanceOf(Error);
        await expect(decode(nil, "42")).rejects.toBeInstanceOf(Error);
        await expect(decode(nil, '["foo"]')).rejects.toBeInstanceOf(Error);
      });
    });

    describe("array", () => {
      it("should parse shallow arrays and reject malformed ones", async () => {
        await expect(decode(array(str), "[]")).resolves.toEqual([]);
        await expect(decode(array(str), '["foo", "bar"]')).resolves.toEqual([
          "foo",
          "bar",
        ]);

        await expect(decode(array(str), "[null]")).rejects.toBeInstanceOf(
          Error,
        );
        await expect(
          decode(array(str), '["foo", "bar", 42]'),
        ).rejects.toBeInstanceOf(Error);
        await expect(
          decode(array(str), '["foo", "bar", true]'),
        ).rejects.toBeInstanceOf(Error);
      });

      it("should parse deep arrays and reject malformed ones", async () => {
        await expect(decode(array(array(num)), "[]")).resolves.toEqual([]);
        await expect(decode(array(array(num)), "[[]]")).resolves.toEqual([[]]);
        await expect(
          decode(array(array(num)), "[[42], [43]]"),
        ).resolves.toEqual([[42], [43]]);

        await expect(
          decode(array(array(num)), "[42, 43]"),
        ).rejects.toBeInstanceOf(Error);
        await expect(
          decode(array(array(num)), '[["foo"], ["bar"]]'),
        ).rejects.toBeInstanceOf(Error);
      });
    });

    describe("maybe", () => {
      it("should parse undefined values and the provided decoder and reject the others", async () => {
        const decoder = object({ foo: maybe(str) });

        await expect(decode(decoder, "{}")).resolves.toEqual({});
        await expect(decode(decoder, '{ "foo": "foo" }')).resolves.toEqual({
          foo: "foo",
        });

        await expect(decode(maybe(str), "null")).rejects.toBeInstanceOf(Error);
        await expect(decode(maybe(str), "42")).rejects.toBeInstanceOf(Error);
      });
    });

    describe("nullable", () => {
      it("should parse null values and the provided decoder and reject the others", async () => {
        await expect(decode(nullable(str), "null")).resolves.toEqual(null);
        await expect(decode(nullable(str), '"foo"')).resolves.toEqual("foo");

        await expect(decode(nullable(str), "undefined")).rejects.toBeInstanceOf(
          Error,
        );
        await expect(decode(nullable(str), "42")).rejects.toBeInstanceOf(Error);
      });
    });

    describe("oneOf", () => {
      it("should parse with only one of the two given decoders and reject the other ones", async () => {
        const decoder = oneOf(str, num);

        await expect(decode(decoder, "42")).resolves.toEqual(42);
        await expect(decode(decoder, '"foo"')).resolves.toEqual("foo");

        await expect(decode(decoder, "true")).rejects.toBeInstanceOf(Error);
        await expect(decode(decoder, "null")).rejects.toBeInstanceOf(Error);
        await expect(decode(decoder, "[]")).rejects.toBeInstanceOf(Error);
      });

      it("should parse with only one of the three given decoders and reject the other ones", async () => {
        const decoder = oneOf(str, num, array(bool));

        await expect(decode(decoder, "42")).resolves.toEqual(42);
        await expect(decode(decoder, '"foo"')).resolves.toEqual("foo");
        await expect(decode(decoder, "[]")).resolves.toEqual([]);
        await expect(decode(decoder, "[true]")).resolves.toEqual([true]);

        await expect(decode(decoder, "true")).rejects.toBeInstanceOf(Error);
        await expect(decode(decoder, "null")).rejects.toBeInstanceOf(Error);
        await expect(decode(decoder, "[42, 43]")).rejects.toBeInstanceOf(Error);
      });
    });

    describe("compose", () => {
      it("should compose the two provided decoders", async () => {
        const decoder = compose(str, str);

        await expect(decode(decoder, '"foo"')).resolves.toEqual("foo");

        await expect(decode(decoder, "42")).rejects.toBeInstanceOf(Error);
      });

      it("should throw even if only one decoder fails", async () => {
        const decoder = compose(str, str, str, str, num);

        await expect(decode(decoder, '"foo"')).rejects.toBeInstanceOf(Error);
      });

      it("should handle as many decoders as needed (up to 10)", async () => {
        const decoder = compose(nil, nullable(str), oneOf(nil, num));

        await expect(decode(decoder, "null")).resolves.toEqual(null);
        await expect(decode(decoder, '"foo"')).rejects.toBeInstanceOf(Error);
        await expect(decode(decoder, "42")).rejects.toBeInstanceOf(Error);
      });

      it("should support recursion", async () => {
        const decoder = compose(nil, compose(nullable(str), oneOf(nil, num)));

        await expect(decode(decoder, "null")).resolves.toEqual(null);
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

        const received = decode(decoder, input);

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

        const received = decode(decoder, input);

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

        const received = decode(decoder, input);

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

        const received = decode(decoder, input);

        await expect(received).resolves.toEqual(expected);
      });
    });
  });
});
