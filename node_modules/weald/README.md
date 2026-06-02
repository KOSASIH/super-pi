# weald

[![codecov](https://img.shields.io/codecov/c/github/achingbrain/weald.svg?style=flat-square)](https://codecov.io/gh/achingbrain/weald)
[![CI](https://img.shields.io/github/actions/workflow/status/achingbrain/weald/js-test-and-release.yml?branch=main\&style=flat-square)](https://github.com/achingbrain/weald/actions/workflows/js-test-and-release.yml?query=branch%3Amain)

> The debug module but TypeScript

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

This module is a fork of the [debug](https://www.npmjs.com/package/debug) module. It has been converted to TypeScript and the output is ESM.

It is API compatible with no extra features or bug fixes, it should only be used if you want a 100% ESM application.

ESM should be arriving in `debug@5.x.x` so this module can be retired after that.

Please see [debug](https://www.npmjs.com/package/debug) for API details.

# Install

```console
$ npm i weald
```

## Browser `<script>` tag

Loading this module through a script tag will make its exports available as `Weald` in the global namespace.

```html
<script src="https://unpkg.com/weald/dist/index.min.js"></script>
```

# API Docs

- <https://achingbrain.github.io/weald>

# License

Licensed under either of

- Apache 2.0, ([LICENSE-APACHE](https://github.com/achingbrain/weald/LICENSE-APACHE) / <http://www.apache.org/licenses/LICENSE-2.0>)
- MIT ([LICENSE-MIT](https://github.com/achingbrain/weald/LICENSE-MIT) / <http://opensource.org/licenses/MIT>)

# Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in the work by you, as defined in the Apache-2.0 license, shall be dual licensed as above, without any additional terms or conditions.
