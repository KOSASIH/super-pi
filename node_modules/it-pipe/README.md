# it-pipe <!-- omit in toc -->

[![codecov](https://img.shields.io/codecov/c/github/alanshaw/it-pipe.svg?style=flat-square)](https://codecov.io/gh/alanshaw/it-pipe)
[![CI](https://img.shields.io/github/actions/workflow/status/alanshaw/it-pipe/js-test-and-release.yml?branch=master\&style=flat-square)](https://github.com/alanshaw/it-pipe/actions/workflows/js-test-and-release.yml?query=branch%3Amaster)

> Utility to "pipe" async iterables together

## Table of contents <!-- omit in toc -->

- [Install](#install)
  - [Browser `<script>` tag](#browser-script-tag)
- [Usage](#usage)
- [API](#api)
  - [`pipe(firstFn, ...fns)`](#pipefirstfn-fns)
- [API Docs](#api-docs)
- [License](#license)
- [Contribution](#contribution)

## Install

```console
$ npm i it-pipe
```

### Browser `<script>` tag

Loading this module through a script tag will make it's exports available as `ItPipe` in the global namespace.

```html
<script src="https://unpkg.com/it-pipe/dist/index.min.js"></script>
```

Based on this definition of streaming iterables <https://gist.github.com/alanshaw/591dc7dd54e4f99338a347ef568d6ee9>.

Almost identical to the [`pipeline`](https://github.com/bustle/streaming-iterables#pipeline) function from the [`streaming-iterables`](https://www.npmjs.com/package/streaming-iterables) module except that it supports duplex streams *and* will automatically wrap a "source" as the first param in a function.

## Usage

```js
import { pipe } from 'it-pipe'

const result = await pipe(
  // A source is just an iterable, this is shorthand for () => [1, 2, 3]
  [1, 2, 3],
  // A transform takes a source, and returns a source.
  // This transform doubles each value asynchronously.
  function transform (source) {
    return (async function * () { // A generator is async iterable
      for await (const val of source) yield val * 2
    })()
  },
  // A sink, it takes a source and consumes it, optionally returning a value.
  // This sink buffers up all the values from the source and returns them.
  async function collect (source) {
    const vals = []
    for await (const val of source) {
      vals.push(val)
    }
    return vals
  }
)

console.log(result) // 2,4,6
```

## API

### `pipe(firstFn, ...fns)`

Calls `firstFn` and then every function in `fns` with the result of the previous function. The final return is the result of the last function in `fns`.

Note:

- `firstFn` may be a `Function` or an `Iterable`
- `firstFn` or any of `fns` may be a [duplex object](https://gist.github.com/alanshaw/591dc7dd54e4f99338a347ef568d6ee9#duplex-it) (an object with a `sink` and `source`).

## API Docs

- <https://alanshaw.github.io/it-pipe>

## License

Licensed under either of

- Apache 2.0, ([LICENSE-APACHE](LICENSE-APACHE) / <http://www.apache.org/licenses/LICENSE-2.0>)
- MIT ([LICENSE-MIT](LICENSE-MIT) / <http://opensource.org/licenses/MIT>)

## Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in the work by you, as defined in the Apache-2.0 license, shall be dual licensed as above, without any additional terms or conditions.
