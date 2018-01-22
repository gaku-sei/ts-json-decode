import {
  array,
  bool,
  decodeAny,
  decodeString,
  map,
  nil,
  num,
  nullable,
  object,
  oneOf,
  str
} from "../src";

describe("Decoders", () => {
  describe("decodeString", () => {
    describe("str", () => {
      it("should parse strings and reject other values", async () => {
        await expect(decodeString(str, '"foo"')).resolves.toEqual("foo");

        await expect(decodeString(str, "foo")).rejects.toBeInstanceOf(Error);
        await expect(decodeString(str, "42")).rejects.toBeInstanceOf(Error);
        await expect(decodeString(str, "true")).rejects.toBeInstanceOf(Error);
        await expect(decodeString(str, '["foo"]')).rejects.toBeInstanceOf(
          Error
        );
        await expect(decodeString(str, "null")).rejects.toBeInstanceOf(Error);
      });
    });

    describe("num", () => {
      it("should parse numbers and reject other values", async () => {
        await expect(decodeString(num, "42")).resolves.toEqual(42);

        await expect(decodeString(num, '"foo"')).rejects.toBeInstanceOf(Error);
        await expect(decodeString(num, "true")).rejects.toBeInstanceOf(Error);
        await expect(decodeString(num, '["foo"]')).rejects.toBeInstanceOf(
          Error
        );
        await expect(decodeString(str, "null")).rejects.toBeInstanceOf(Error);
      });
    });

    describe("bool", () => {
      it("should parse booleans and reject other values", async () => {
        await expect(decodeString(bool, "true")).resolves.toEqual(true);

        await expect(decodeString(bool, '"foo"')).rejects.toBeInstanceOf(Error);
        await expect(decodeString(bool, "42")).rejects.toBeInstanceOf(Error);
        await expect(decodeString(bool, '["foo"]')).rejects.toBeInstanceOf(
          Error
        );
        await expect(decodeString(str, "null")).rejects.toBeInstanceOf(Error);
      });
    });

    describe("nil", () => {
      it("should parse nulls and reject other values", async () => {
        await expect(decodeString(nil, "null")).resolves.toEqual(null);

        await expect(decodeString(nil, "true")).rejects.toBeInstanceOf(Error);
        await expect(decodeString(nil, '"foo"')).rejects.toBeInstanceOf(Error);
        await expect(decodeString(nil, "42")).rejects.toBeInstanceOf(Error);
        await expect(decodeString(nil, '["foo"]')).rejects.toBeInstanceOf(
          Error
        );
      });
    });

    describe("array", () => {
      it("should parse shallow arrays and reject malformed ones", async () => {
        await expect(decodeString(array(str), "[]")).resolves.toEqual([]);
        await expect(
          decodeString(array(str), '["foo", "bar"]')
        ).resolves.toEqual(["foo", "bar"]);

        await expect(decodeString(array(str), "[null]")).rejects.toBeInstanceOf(
          Error
        );
        await expect(
          decodeString(array(str), '["foo", "bar", 42]')
        ).rejects.toBeInstanceOf(Error);
        await expect(
          decodeString(array(str), '["foo", "bar", true]')
        ).rejects.toBeInstanceOf(Error);
      });

      it("should parse deep arrays and reject malformed ones", async () => {
        await expect(decodeString(array(array(num)), "[]")).resolves.toEqual(
          []
        );
        await expect(decodeString(array(array(num)), "[[]]")).resolves.toEqual([
          []
        ]);
        await expect(
          decodeString(array(array(num)), "[[42], [43]]")
        ).resolves.toEqual([[42], [43]]);

        await expect(
          decodeString(array(array(num)), "[42, 43]")
        ).rejects.toBeInstanceOf(Error);
        await expect(
          decodeString(array(array(num)), '[["foo"], ["bar"]]')
        ).rejects.toBeInstanceOf(Error);
      });
    });

    describe("nullable", () => {
      it("should parse null values and the provided decoder and reject the others", async () => {
        await expect(decodeString(nullable(str), "null")).resolves.toEqual(
          null
        );
        await expect(decodeString(nullable(str), '"foo"')).resolves.toEqual(
          "foo"
        );

        await expect(
          decodeString(nullable(str), "undefined")
        ).rejects.toBeInstanceOf(Error);
        await expect(decodeString(nullable(str), "42")).rejects.toBeInstanceOf(
          Error
        );
      });
    });

    describe("oneOf", () => {
      it("should parse with only one of the two given decoders and reject the other ones", async () => {
        const decoder = oneOf(str, num);

        await expect(decodeString(decoder, "42")).resolves.toEqual(42);
        await expect(decodeString(decoder, '"foo"')).resolves.toEqual("foo");

        await expect(decodeString(decoder, "true")).rejects.toBeInstanceOf(
          Error
        );
        await expect(decodeString(decoder, "null")).rejects.toBeInstanceOf(
          Error
        );
        await expect(decodeString(decoder, "[]")).rejects.toBeInstanceOf(Error);
      });

      it("should parse with only one of the three given decoders and reject the other ones", async () => {
        const decoder = oneOf(str, num, array(bool));

        await expect(decodeString(decoder, "42")).resolves.toEqual(42);
        await expect(decodeString(decoder, '"foo"')).resolves.toEqual("foo");
        await expect(decodeString(decoder, "[]")).resolves.toEqual([]);
        await expect(decodeString(decoder, "[true]")).resolves.toEqual([true]);

        await expect(decodeString(decoder, "true")).rejects.toBeInstanceOf(
          Error
        );
        await expect(decodeString(decoder, "null")).rejects.toBeInstanceOf(
          Error
        );
        await expect(decodeString(decoder, "[42, 43]")).rejects.toBeInstanceOf(
          Error
        );
      });
    });

    describe("object", () => {
      it("should parse a simple object according to the given decoders", async () => {
        const decoder = object({
          foo: str,
          bar: num,
          baz: array(bool)
        });

        const input = `
          {
            "foo": "bar",
            "bar": 42,
            "baz": [true, false]
          }
        `;

        const expected = { foo: "bar", bar: 42, baz: [true, false] };

        const received = decodeString(decoder, input);
                await expect(received).resolves.toEqual(expected);
      });

      it("should parse a simple object according to the given decoders and allow extra attributes", async () => {
        const decoder = object({
          foo: str,
          bar: num,
          baz: array(bool)
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

        const received = decodeString(decoder, input);

        await expect(received).resolves.toEqual(expected);
      });

      it("should parse a complex object according to the given decoders", async () => {
        const decoder = object({
          foo: str,
          bar: object({
            qux: array(nullable(bool)),
            quux: num
          }),
          baz: array(bool)
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
          baz: [true, false]
        };

>>>>>>> feat: New map function + New decodeAny function
        const received = decodeString(decoder, input);

        await expect(received).resolves.toEqual(expected);
      });
<<<<<<< HEAD
    });

    describe("map", () => {
      it("should create a new decoder, parsing input as string and transforming to number the output", async () => {
        const decoder = map(({ length }) => length, str);

        await expect(decodeString(decoder, '"foo"')).resolves.toEqual(3);

        await expect(decodeString(decoder, "42")).rejects.toBeInstanceOf(Error);
      });

      it("should handle several decoders", async () => {
        const decoder = map(() => 1, str, str, str, str, str);

        await expect(decodeString(decoder, '"foo"')).resolves.toEqual(1);

        await expect(decodeString(decoder, "42")).rejects.toBeInstanceOf(Error);
        await expect(decodeString(decoder, "true")).rejects.toBeInstanceOf(
          Error
        );
      });

      it("should throw even if only one decoder fails", async () => {
        const decoder = map(() => null, str, str, str, str, num);

        await expect(decodeString(decoder, '"foo"')).rejects.toBeInstanceOf(
          Error
        );
      });

      it("should handle as many decoders as needed (up to 10)", async () => {
        const decoder = map(
          (x, y, z) => ({ x, y, z }),
          nil,
          nullable(str),
          oneOf(nil, num)
        );

        await expect(decodeString(decoder, "null")).resolves.toEqual({
          x: null,
          y: null,
          z: null
        });

        await expect(decodeString(decoder, '"foo"')).rejects.toBeInstanceOf(
          Error
        );
        await expect(decodeString(decoder, "42")).rejects.toBeInstanceOf(Error);
      });
=======
>>>>>>> feat: New map function + New decodeAny function
    });

    describe("complex nested validators", () => {
      it("should pass the stress test", async () => {
        const decoder = array(
          nullable(
            array(
              object({
                foo: nullable(num),
                bar: object({
                  baz: nullable(str)
                })
              })
            )
          )
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
                baz: "foo"
              }
            },
            {
              foo: 42,
              bar: {
                baz: "bar"
              }
            },
            {
              foo: 43,
              bar: {
                baz: null
              }
            },
            {
              foo: null,
              bar: {
                baz: null
              }
            }
          ],
          null,
          [],
          null
        ];

        const received = decodeString(decoder, input);

        await expect(received).resolves.toEqual(expected);
      });
    });
  });

  describe("decodeValue", () => {
    describe("str", () => {
      it("should parse strings and reject other values", async () => {
        await expect(decodeAny(str, "foo")).resolves.toEqual("foo");

        await expect(decodeAny(str, 42)).rejects.toBeInstanceOf(Error);
        await expect(decodeAny(str, true)).rejects.toBeInstanceOf(Error);
        await expect(decodeAny(str, ["foo"])).rejects.toBeInstanceOf(Error);
        await expect(decodeAny(str, null)).rejects.toBeInstanceOf(Error);
<<<<<<< HEAD
      });
    });

    describe("num", () => {
      it("should parse numbers and reject other values", async () => {
        await expect(decodeAny(num, 42)).resolves.toEqual(42);

        await expect(decodeAny(num, "foo")).rejects.toBeInstanceOf(Error);
        await expect(decodeAny(num, true)).rejects.toBeInstanceOf(Error);
        await expect(decodeAny(num, ["foo"])).rejects.toBeInstanceOf(Error);
        await expect(decodeAny(str, null)).rejects.toBeInstanceOf(Error);
      });
    });

    describe("bool", () => {
      it("should parse booleans and reject other values", async () => {
        await expect(decodeAny(bool, true)).resolves.toEqual(true);

=======
      });
    });

    describe("num", () => {
      it("should parse numbers and reject other values", async () => {
        await expect(decodeAny(num, 42)).resolves.toEqual(42);

        await expect(decodeAny(num, "foo")).rejects.toBeInstanceOf(Error);
        await expect(decodeAny(num, true)).rejects.toBeInstanceOf(Error);
        await expect(decodeAny(num, ["foo"])).rejects.toBeInstanceOf(Error);
        await expect(decodeAny(str, null)).rejects.toBeInstanceOf(Error);
      });
    });

    describe("bool", () => {
      it("should parse booleans and reject other values", async () => {
        await expect(decodeAny(bool, true)).resolves.toEqual(true);

>>>>>>> feat: New map function + New decodeAny function
        await expect(decodeAny(bool, "foo")).rejects.toBeInstanceOf(Error);
        await expect(decodeAny(bool, 42)).rejects.toBeInstanceOf(Error);
        await expect(decodeAny(bool, ["foo"])).rejects.toBeInstanceOf(Error);
        await expect(decodeAny(str, null)).rejects.toBeInstanceOf(Error);
      });
    });

    describe("nil", () => {
      it("should parse nulls and reject other values", async () => {
        await expect(decodeAny(nil, null)).resolves.toEqual(null);

        await expect(decodeAny(nil, true)).rejects.toBeInstanceOf(Error);
        await expect(decodeAny(nil, "foo")).rejects.toBeInstanceOf(Error);
        await expect(decodeAny(nil, 42)).rejects.toBeInstanceOf(Error);
        await expect(decodeAny(nil, ["foo"])).rejects.toBeInstanceOf(Error);
      });
<<<<<<< HEAD
    });

    describe("array", () => {
      it("should parse shallow arrays and reject malformed ones", async () => {
        await expect(decodeAny(array(str), [])).resolves.toEqual([]);
        await expect(decodeAny(array(str), ["foo", "bar"])).resolves.toEqual([
          "foo",
          "bar"
        ]);

        await expect(decodeAny(array(str), [null])).rejects.toBeInstanceOf(
          Error
        );
        await expect(
          decodeAny(array(str), ["foo", "bar", 42])
        ).rejects.toBeInstanceOf(Error);
        await expect(
          decodeAny(array(str), ["foo", "bar", true])
        ).rejects.toBeInstanceOf(Error);
=======
    });

    describe("array", () => {
      it("should parse shallow arrays and reject malformed ones", async () => {
        await expect(decodeAny(array(str), [])).resolves.toEqual([]);
        await expect(decodeAny(array(str), ["foo", "bar"])).resolves.toEqual([
          "foo",
          "bar"
        ]);

        await expect(decodeAny(array(str), [null])).rejects.toBeInstanceOf(
          Error
        );
        await expect(
          decodeAny(array(str), ["foo", "bar", 42])
        ).rejects.toBeInstanceOf(Error);
        await expect(
          decodeAny(array(str), ["foo", "bar", true])
        ).rejects.toBeInstanceOf(Error);
      });

      it("should parse deep arrays and reject malformed ones", async () => {
        await expect(decodeAny(array(array(num)), [])).resolves.toEqual([]);
        await expect(decodeAny(array(array(num)), [[]])).resolves.toEqual([[]]);
        await expect(
          decodeAny(array(array(num)), [[42], [43]])
        ).resolves.toEqual([[42], [43]]);

        await expect(
          decodeAny(array(array(num)), [42, 43])
        ).rejects.toBeInstanceOf(Error);
        await expect(
          decodeAny(array(array(num)), [["foo"], ["bar"]])
        ).rejects.toBeInstanceOf(Error);
      });
    });

    describe("nullable", () => {
      it("should parse null values and the provided decoder and reject the others", async () => {
        await expect(decodeAny(nullable(str), null)).resolves.toEqual(null);
        await expect(decodeAny(nullable(str), "foo")).resolves.toEqual("foo");

        await expect(
          decodeAny(nullable(str), undefined)
        ).rejects.toBeInstanceOf(Error);
        await expect(decodeAny(nullable(str), 42)).rejects.toBeInstanceOf(
          Error
        );
>>>>>>> feat: New map function + New decodeAny function
      });
    });

    describe("oneOf", () => {
      it("should parse with only one of the two given decoders and reject the other ones", async () => {
        const decoder = oneOf(str, num);

<<<<<<< HEAD
      it("should parse deep arrays and reject malformed ones", async () => {
        await expect(decodeAny(array(array(num)), [])).resolves.toEqual([]);
        await expect(decodeAny(array(array(num)), [[]])).resolves.toEqual([[]]);
        await expect(
          decodeAny(array(array(num)), [[42], [43]])
        ).resolves.toEqual([[42], [43]]);

        await expect(
          decodeAny(array(array(num)), [42, 43])
        ).rejects.toBeInstanceOf(Error);
        await expect(
          decodeAny(array(array(num)), [["foo"], ["bar"]])
        ).rejects.toBeInstanceOf(Error);
      });
    });

    describe("nullable", () => {
      it("should parse null values and the provided decoder and reject the others", async () => {
        await expect(decodeAny(nullable(str), null)).resolves.toEqual(null);
        await expect(decodeAny(nullable(str), "foo")).resolves.toEqual("foo");

        await expect(
          decodeAny(nullable(str), undefined)
        ).rejects.toBeInstanceOf(Error);
        await expect(decodeAny(nullable(str), 42)).rejects.toBeInstanceOf(
          Error
        );
      });
    });

    describe("oneOf", () => {
      it("should parse with only one of the two given decoders and reject the other ones", async () => {
        const decoder = oneOf(str, num);

        await expect(decodeAny(decoder, 42)).resolves.toEqual(42);
        await expect(decodeAny(decoder, "foo")).resolves.toEqual("foo");

        await expect(decodeAny(decoder, true)).rejects.toBeInstanceOf(Error);
        await expect(decodeAny(decoder, null)).rejects.toBeInstanceOf(Error);
        await expect(decodeAny(decoder, [])).rejects.toBeInstanceOf(Error);
      });

      it("should parse with only one of the three given decoders and reject the other ones", async () => {
        const decoder = oneOf(str, num, array(bool));

        await expect(decodeAny(decoder, 42)).resolves.toEqual(42);
        await expect(decodeAny(decoder, "foo")).resolves.toEqual("foo");
        await expect(decodeAny(decoder, [])).resolves.toEqual([]);
        await expect(decodeAny(decoder, [true])).resolves.toEqual([true]);

=======
        await expect(decodeAny(decoder, 42)).resolves.toEqual(42);
        await expect(decodeAny(decoder, "foo")).resolves.toEqual("foo");

        await expect(decodeAny(decoder, true)).rejects.toBeInstanceOf(Error);
        await expect(decodeAny(decoder, null)).rejects.toBeInstanceOf(Error);
        await expect(decodeAny(decoder, [])).rejects.toBeInstanceOf(Error);
      });

      it("should parse with only one of the three given decoders and reject the other ones", async () => {
        const decoder = oneOf(str, num, array(bool));

        await expect(decodeAny(decoder, 42)).resolves.toEqual(42);
        await expect(decodeAny(decoder, "foo")).resolves.toEqual("foo");
        await expect(decodeAny(decoder, [])).resolves.toEqual([]);
        await expect(decodeAny(decoder, [true])).resolves.toEqual([true]);

>>>>>>> feat: New map function + New decodeAny function
        await expect(decodeAny(decoder, true)).rejects.toBeInstanceOf(Error);
        await expect(decodeAny(decoder, null)).rejects.toBeInstanceOf(Error);
        await expect(decodeAny(decoder, [42, 43])).rejects.toBeInstanceOf(
          Error
        );
      });
    });

    describe("object", () => {
      it("should parse a simple object according to the given decoders", async () => {
        const decoder = object({
          foo: str,
          bar: num,
          baz: array(bool)
        });

        const input = {
          foo: "bar",
          bar: 42,
          baz: [true, false]
        };

        const received = decodeAny(decoder, input);

        await expect(received).resolves.toEqual(input);
      });

      it("should parse a simple object according to the given decoders and allow extra attributes", async () => {
        const decoder = object({
          foo: str,
          bar: num,
          baz: array(bool)
        });

        // The value is expected to be present at runtime
        // but won't be accessible at compile time
        const input = {
          foo: "bar",
          bar: 42,
          baz: [true, false],
          qux: true
        };

        const received = decodeAny(decoder, input);

        await expect(received).resolves.toEqual(input);
      });
<<<<<<< HEAD

      it("should parse a complex object according to the given decoders", async () => {
        const decoder = object({
          foo: str,
          bar: object({
            qux: array(nullable(bool)),
            quux: num
          }),
          baz: array(bool)
        });

        const input = {
          foo: "bar",
          bar: {
            qux: [true, null, false],
            quux: 42
          },
          baz: [true, false]
        };

        const received = decodeAny(decoder, input);

        await expect(received).resolves.toEqual(input);
      });
    });

    describe("map", () => {
      it("should create a new decoder, parsing input as string and transforming to number the output", async () => {
        const decoder = map(({ length }) => length, str);

        await expect(decodeAny(decoder, "foo")).resolves.toEqual(3);

        await expect(decodeAny(decoder, 42)).rejects.toBeInstanceOf(Error);
      });

      it("should handle several decoders", async () => {
        const decoder = map(() => 1, str, str, str, str, str);

        await expect(decodeAny(decoder, "foo")).resolves.toEqual(1);

        await expect(decodeAny(decoder, 42)).rejects.toBeInstanceOf(Error);
        await expect(decodeAny(decoder, true)).rejects.toBeInstanceOf(Error);
      });

      it("should throw even if only one decoder fails", async () => {
        const decoder = map(() => null, str, str, str, str, num);

        await expect(decodeAny(decoder, "foo")).rejects.toBeInstanceOf(Error);
      });

      it("should handle as many decoders as needed (up to 10)", async () => {
        const decoder = map(
          (x, y, z) => ({ x, y, z }),
          nil,
          nullable(str),
          oneOf(nil, num)
        );

        await expect(decodeAny(decoder, null)).resolves.toEqual({
          x: null,
          y: null,
          z: null
        });

        await expect(decodeAny(decoder, "foo")).rejects.toBeInstanceOf(Error);
        await expect(decodeAny(decoder, 42)).rejects.toBeInstanceOf(Error);
=======

      it("should parse a complex object according to the given decoders", async () => {
        const decoder = object({
          foo: str,
          bar: object({
            qux: array(nullable(bool)),
            quux: num
          }),
          baz: array(bool)
        });

        const input = {
          foo: "bar",
          bar: {
            qux: [true, null, false],
            quux: 42
          },
          baz: [true, false]
        };

        const received = decodeAny(decoder, input);

        await expect(received).resolves.toEqual(input);
>>>>>>> feat: New map function + New decodeAny function
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
                  baz: nullable(str)
                })
              })
            )
          )
        );

        const input = [
          null,
          [
            {
              foo: null,
              bar: {
                baz: "foo"
              }
            },
            {
              foo: 42,
              bar: {
                baz: "bar"
              }
            },
            {
              foo: 43,
              bar: {
                baz: null
              }
            },
            {
              foo: null,
              bar: {
                baz: null
              }
            }
          ],
          null,
          [],
          null
        ];

        const received = decodeAny(decoder, input);

        await expect(received).resolves.toEqual(input);
      });
    });
  });
});
