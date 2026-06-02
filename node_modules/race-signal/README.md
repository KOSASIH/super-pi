# race-signal <!-- omit in toc -->

[![codecov](https://img.shields.io/codecov/c/github/achingbrain/race-signal.svg?style=flat-square)](https://codecov.io/gh/achingbrain/race-signal)
[![CI](https://img.shields.io/github/actions/workflow/status/achingbrain/race-signal/js-test-and-release.yml?branch=main\&style=flat-square)](https://github.com/achingbrain/race-signal/actions/workflows/js-test-and-release.yml?query=branch%3Amain)

> Race a promise against an AbortSignal

## Table of contents <!-- omit in toc -->

- [Install](#install)
  - [Browser `<script>` tag](#browser-script-tag)
- [Example](#example)
- [API Docs](#api-docs)
- [License](#license)
- [Contribution](#contribution)

## Install

```console
$ npm i race-signal
```

### Browser `<script>` tag

Loading this module through a script tag will make it's exports available as `RaceSignal` in the global namespace.

```html
<script src="https://unpkg.com/race-signal/dist/index.min.js"></script>
```

## Example

```js
const { raceSignal } = require('race-signal')

const controller = new AbortController()

const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('a value')
  }, 1000)
})

setTimeout(() => {
  controller.abort()
}, 500)

// throws an AbortError
const resolve = await raceSignal(promise, controller.signal)
```

## API Docs

- <https://achingbrain.github.io/race-signal>

## License

Licensed under either of

- Apache 2.0, ([LICENSE-APACHE](LICENSE-APACHE) / <http://www.apache.org/licenses/LICENSE-2.0>)
- MIT ([LICENSE-MIT](LICENSE-MIT) / <http://opensource.org/licenses/MIT>)

## Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in the work by you, as defined in the Apache-2.0 license, shall be dual licensed as above, without any additional terms or conditions.
