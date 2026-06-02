# abort-error

[![codecov](https://img.shields.io/codecov/c/github/achingbrain/abort-error.svg?style=flat-square)](https://codecov.io/gh/achingbrain/abort-error)
[![CI](https://img.shields.io/github/actions/workflow/status/achingbrain/abort-error/js-test-and-release.yml?branch=main\&style=flat-square)](https://github.com/achingbrain/abort-error/actions/workflows/js-test-and-release.yml?query=branch%3Amain)

> An error to be used by AbortSignal handlers

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

A simple error class and options interface that seems to get copied from
project to project.

## Example - Using AbortError

```JavaScript
import { AbortError } from 'abort-error'

// a promise that will be settled later
const deferred = Promise.withResolvers()

const signal = AbortSignal.timeout(1000)
signal.addEventListener('abort', () => {
  deferred.reject(new AbortError())
})
```

## Example - Using AbortOptions

```TypeScript
import type { AbortOptions } from 'abort-error'

async function myFunction (options?: AbortOptions) {
  return fetch('https://example.com', {
    signal: options?.signal
  })
}
```

# Install

```console
$ npm i abort-error
```

## Browser `<script>` tag

Loading this module through a script tag will make its exports available as `AbortError` in the global namespace.

```html
<script src="https://unpkg.com/abort-error/dist/index.min.js"></script>
```

# API Docs

- <https://achingbrain.github.io/abort-error>

# License

Licensed under either of

- Apache 2.0, ([LICENSE-APACHE](https://github.com/achingbrain/abort-error/LICENSE-APACHE) / <http://www.apache.org/licenses/LICENSE-2.0>)
- MIT ([LICENSE-MIT](https://github.com/achingbrain/abort-error/LICENSE-MIT) / <http://opensource.org/licenses/MIT>)

# Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in the work by you, as defined in the Apache-2.0 license, shall be dual licensed as above, without any additional terms or conditions.
