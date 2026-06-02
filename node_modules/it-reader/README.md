# it-reader <!-- omit in toc -->

[![codecov](https://img.shields.io/codecov/c/github/alanshaw/it-reader.svg?style=flat-square)](https://codecov.io/gh/alanshaw/it-reader)
[![CI](https://img.shields.io/github/actions/workflow/status/alanshaw/it-reader/js-test-and-release.yml?branch=master\&style=flat-square)](https://github.com/alanshaw/it-reader/actions/workflows/js-test-and-release.yml?query=branch%3Amaster)

> Read an exact number of bytes from a binary (async) iterable

## Table of contents <!-- omit in toc -->

- [Install](#install)
  - [Browser `<script>` tag](#browser-script-tag)
- [Usage](#usage)
- [API](#api)
  - [`reader(source)`](#readersource)
    - [Parameters](#parameters)
    - [Returns](#returns)
- [Contribute](#contribute)
- [API Docs](#api-docs)
- [License](#license)
- [Contribution](#contribution)

## Install

```console
$ npm i it-reader
```

### Browser `<script>` tag

Loading this module through a script tag will make it's exports available as `ItReader` in the global namespace.

```html
<script src="https://unpkg.com/it-reader/dist/index.min.js"></script>
```

## Usage

```js
import { reader } from 'it-reader'

const stream = reader(source) // source is any iterable or async iterable
const { value, done } = await stream.next(8)

// NOTE: value is a BufferList (https://npm.im/bl)
console.log(value.toString())

// Now read 16 more bytes:
await stream.next(16)

// or...
// Consume the rest of the stream

for await (const chunk of stream) {
  console.log(chunk.toString())
}
```

## API

```js
import { reader } from 'it-reader'
```

### `reader(source)`

Create and return a new reader.

#### Parameters

- `source` (`Iterable`) - An [iterable or async iterable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) that yields [`Buffer`](https://npm.im/buffer) or [`BufferList`](https://npm.im/bl) objects.

#### Returns

An [async iterator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterator_protocol) that yields [`BufferList`](https://npm.im/bl) objects.

The iterator's `next` method takes an *optional* parameter - the number of bytes to read from the `source`.

If the number of bytes to read are not specified, the iterator will yield any bytes remaining in the internal buffer or the next available chunk.

If the number of bytes to read exceeds the number of bytes available in the source the iterator will throw and error with a `code` property set to `'ERR_UNDER_READ'` and a `buffer` property (the bytes read so far, if any), which is a [`BufferList`](https://npm.im/bl) instance.

## Contribute

Feel free to dive in! [Open an issue](https://github.com/alanshaw/it-reader/issues/new) or submit PRs.

## API Docs

- <https://alanshaw.github.io/it-reader>

## License

Licensed under either of

- Apache 2.0, ([LICENSE-APACHE](LICENSE-APACHE) / <http://www.apache.org/licenses/LICENSE-2.0>)
- MIT ([LICENSE-MIT](LICENSE-MIT) / <http://opensource.org/licenses/MIT>)

## Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in the work by you, as defined in the Apache-2.0 license, shall be dual licensed as above, without any additional terms or conditions.
