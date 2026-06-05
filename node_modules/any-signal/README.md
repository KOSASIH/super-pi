# any-signal

[![codecov](https://img.shields.io/codecov/c/github/jacobheun/any-signal.svg?style=flat-square)](https://codecov.io/gh/jacobheun/any-signal)
[![CI](https://img.shields.io/github/actions/workflow/status/jacobheun/any-signal/js-test-and-release.yml?branch=master\&style=flat-square)](https://github.com/jacobheun/any-signal/actions/workflows/js-test-and-release.yml?query=branch%3Amaster)

> Combines an array of AbortSignals into a single signal that is aborted when any signal is

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

Similar to [AbortSignal.any](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/any_static)
except the returned promise has a `.clear` method that removes all event
listeners added to passed signals preventing memory leaks.

At the time of writing at least, `AbortSignal.any` leaks memory in Node.js
and Deno environments:

- <https://github.com/nodejs/node/issues/54614>
- <https://github.com/denoland/deno/issues/24842>

## Example

```js
import { anySignal } from 'any-signal'

const userController = new AbortController()

// Abort after 1 second
const timeoutSignal = AbortSignal.timeout(1000)

const combinedSignal = anySignal([userController.signal, timeoutSignal])
combinedSignal.addEventListener('abort', () => console.log('Abort!'))

try {
  // The user or the timeout can now abort the action
  await performSomeAction({ signal: combinedSignal })
} finally {
  // Clear will clean up internal event handlers
  combinedSignal.clear()
}
```

# Install

```console
$ npm i any-signal
```

## Browser `<script>` tag

Loading this module through a script tag will make its exports available as `AnySignal` in the global namespace.

```html
<script src="https://unpkg.com/any-signal/dist/index.min.js"></script>
```

## Acknowledgements

The anySignal function is taken from a [comment by jakearchibald](https://github.com/whatwg/fetch/issues/905#issuecomment-491970649)

# API Docs

- <https://jacobheun.github.io/any-signal>

# License

Licensed under either of

- Apache 2.0, ([LICENSE-APACHE](https://github.com/jacobheun/any-signal/LICENSE-APACHE) / <http://www.apache.org/licenses/LICENSE-2.0>)
- MIT ([LICENSE-MIT](https://github.com/jacobheun/any-signal/LICENSE-MIT) / <http://opensource.org/licenses/MIT>)

# Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in the work by you, as defined in the Apache-2.0 license, shall be dual licensed as above, without any additional terms or conditions.
