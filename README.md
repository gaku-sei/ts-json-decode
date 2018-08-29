# TypeScript JSON Decode

## What is it? Why does it matter?

`ts-json-decode` is a lightweight library (no dependencies) that allows complex data and strings decoding.

Most of front end applications must deal with data coming from, or going to, the outside.
Whether these data are fetched from a server, retrieved from the local storage, or simply input by the user, they are all **unsafe**.

In TypeScript unsafe often means `any`, or, since TypeScript 3.0, `unknown`.

For example `JSON.parse` (which is widely used to parse data coming from a server) returns `any`.
The solution then, in order to keep the illusion of "type safeness" is to blindly cast this `any` value into the desired type.
TypeScript will joyfully compile, the developer enjoys that fancy autocompletion feature offered by TypeScript, and everything seems to be fine.
Until the moment the data coming from the server changes.

Here is a simple example using the `fetch` API:

```TypeScript
interface Resource {
  foo: string;
  bar: number;
}

async function fetchResource(): Promise<Resource> {
  const res = await fetch("https://my-server.com/resource");

  const data: Resource = await res.json();

  return data;
}
```

If `https://my-server.com/resource` returns a resource that differs from the `Resource` interface, a runtime error will occur, and it could be hard to debug.
This can be a pragmatic, easy win, solution especially for tiny applications, with small, controlled, versioned, and slowly moving API, but scalability issues will araise quickly.

The target of `ts-json-decode` is to ensure type safeness with a simple yet complete API.

```TypeScript
import { Decoder, decodeValue, num, object, str } from "ts-json-decode";

interface Resource {
  bar: number;
  foo: string;
}

const decoder: Decoder<Resource> = object({
  bar: num,
  foo: str,
});

async function fetchResource(): Promise<Resource> {
  const res = await fetch("https://my-server.com/resource");

  const data = decodeValue(decoder, await res.json());

  return data;
}
```

`data` will automatically be a valid `Resource` object.
If something goes wrong, for instance if `foo` is missing, or if `bar` is a `string`, then an explicit error is thrown (and catchable with the `catch` method in the previous example).

## Documentation

A full documentation can be found [here](http://gaku-sei.github.io/ts-json-decode/docs).

## API

### Decoder runners

A `Decoder` is a simple function that will validate a data against a schema.
In order to actually run the validation, two functions are provided: `decodeValue` and `decodeString`.

```TypeScript
import { decodeString, decodeValue } from 'ts-json-decode';

import { decoder } from './myLibrary';

// `decodeValue` will decode (and validate) any kind of data structure
const data = decodeValue(decoder, { foo: "bar" });
// `decodeString` will parse and decode json stringified strings
const data = decodeString(decoder, '{ "foo": "bar" }');
```

If the runner can't decode the provided string/value, an error is thrown.
You may easily wrap the code above in a `Promise` or an `Observable`.

### Safe decoders

Are considered "safe", decoders returning value whose type is a proper TypeScript type or interface, without extra checks. For example `str`, `num`, or `nil` are all "safe", since `string`, `number` and `null` types exist in TypeScript.

```TypeScript
import { decodeString, nil, num, str } from "ts-json-decoder";

const nilValue = decodeString(nil, "null");

const numValue = decodeString(num, "42");

const strValue = decodeString(str, '"foobar"');
```

### Unsafe decoders

Are considered "unsafe", decoders returning value that **cannot** be completely type checked by TypeScript, mainly because of the limitations of the current TypeScript type system.

Most of the time, these decoders are strongly related to the concept of [dependent typing](https://en.wikipedia.org/wiki/Dependent_type).
Hopefully, this concept could arrive [one day](https://github.com/Microsoft/TypeScript/pull/21316#issuecomment-36019748) in TypeScript.

They include decoders such as `minLength` or `maxLength` validating strings' length, or `int` validating that a number is an integer.

### Additional tools

You may also `map` or `compose` decoders, allowing complex data to be decoded/validated and transformed on the fly. A `field` decoder also exist when you just need to read one attribute of an object.

```TypeScript
import { decodeString, map, str } from "ts-json-decode";

// `decoder` has type `Decoder<number>` here
const decoder = map(({ length }) => length, str);

// `length` equals 6
const length = decodeString(decoder, '"foobar"');
```

Or using `compose` and `map` as well:

```TypeScript
import { decodeString, compose, num, object, str } from "ts-json-decode";

const decoder = compose(
  map(({ length }) => length, str),
  map(x => x ** 2, num),
);

// `squaredLength` equals 36
const squaredLength = decodeString(decoder, '"foobar"');
```
