# race-signal

[![codecov](https://img.shields.io/codecov/c/github/achingbrain/race-signal.svg?style=flat-square)](https://codecov.io/gh/achingbrain/race-signal)
[![CI](https://img.shields.io/github/actions/workflow/status/achingbrain/race-signal/js-test-and-release.yml?branch=main\&style=flat-square)](https://github.com/achingbrain/race-signal/actions/workflows/js-test-and-release.yml?query=branch%3Amain)

> Race a promise against an AbortSignal

# About

<!--

!IMPORTANT!

Everything in this README between "# About" and "# Install" is automatically
generated and will be overwritten the next time the doc generator is run.

To make changes to this section, please update the @packageDocumentation section
of src/index.js or src/index.ts

To experiment with formatting, please run "npm run docs" from the root of this
repo and examine the changes made.

-->

Pass a promise and an abort signal and await the result.

## Example - Basic usage

```ts
import { raceSignal } from 'race-signal'

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

## Example - Overriding errors

By default the thrown error is the `.reason` property of the signal but it's
possible to override this behaviour with the `translateError` option:

```ts
import { raceSignal } from 'race-signal'

const controller = new AbortController()

const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('a value')
  }, 1000)
})

setTimeout(() => {
  controller.abort()
}, 500)

// throws `Error('Oh no!')`
const resolve = await raceSignal(promise, controller.signal, {
  translateError: (signal) => {
    // use `signal`, or don't
    return new Error('Oh no!')
  }
})
```

# Install

```console
$ npm i race-signal
```

## Browser `<script>` tag

Loading this module through a script tag will make its exports available as `RaceSignal` in the global namespace.

```html
<script src="https://unpkg.com/race-signal/dist/index.min.js"></script>
```

# API Docs

- <https://achingbrain.github.io/race-signal>

# License

Licensed under either of

- Apache 2.0, ([LICENSE-APACHE](https://github.com/achingbrain/race-signal/LICENSE-APACHE) / <http://www.apache.org/licenses/LICENSE-2.0>)
- MIT ([LICENSE-MIT](https://github.com/achingbrain/race-signal/LICENSE-MIT) / <http://opensource.org/licenses/MIT>)

# Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in the work by you, as defined in the Apache-2.0 license, shall be dual licensed as above, without any additional terms or conditions.
