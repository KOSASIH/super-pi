# @multiformats/multiaddr-matcher

[![multiformats.io](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://multiformats.io)
[![codecov](https://img.shields.io/codecov/c/github/multiformats/js-multiaddr-matcher.svg?style=flat-square)](https://codecov.io/gh/multiformats/js-multiaddr-matcher)
[![CI](https://img.shields.io/github/actions/workflow/status/multiformats/js-multiaddr-matcher/js-test-and-release.yml?branch=main\&style=flat-square)](https://github.com/multiformats/js-multiaddr-matcher/actions/workflows/js-test-and-release.yml?query=branch%3Amain)

> Match different multiaddr formats

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

This module exports various matchers that can be used to infer the type of a
passed multiaddr.

## Example

```ts
import { multiaddr } from '@multiformats/multiaddr'
import { DNS } from '@multiformats/multiaddr-matcher'

const ma = multiaddr('/dnsaddr/example.org')

DNS.matches(ma) // true - this is a multiaddr with a DNS address at the start
```

## Example

The default matching behaviour ignores any subsequent tuples in the multiaddr.
If you want stricter matching you can use `.exactMatch`:

```ts
import { multiaddr } from '@multiformats/multiaddr'
import { DNS, Circuit } from '@multiformats/multiaddr-matcher'

const ma = multiaddr('/dnsaddr/example.org/p2p/QmFoo/p2p-circuit/p2p/QmBar')

DNS.exactMatch(ma) // false - this address has extra tuples after the DNS component
Circuit.matches(ma) // true
Circuit.exactMatch(ma) // true - the extra tuples are circuit relay related
```

# Install

```console
$ npm i @multiformats/multiaddr-matcher
```

## Browser `<script>` tag

Loading this module through a script tag will make its exports available as `MultiformatsMultiaddrMatcher` in the global namespace.

```html
<script src="https://unpkg.com/@multiformats/multiaddr-matcher/dist/index.min.js"></script>
```

# API Docs

- <https://multiformats.github.io/js-multiaddr-matcher>

# License

Licensed under either of

- Apache 2.0, ([LICENSE-APACHE](https://github.com/multiformats/js-multiaddr-matcher/LICENSE-APACHE) / <http://www.apache.org/licenses/LICENSE-2.0>)
- MIT ([LICENSE-MIT](https://github.com/multiformats/js-multiaddr-matcher/LICENSE-MIT) / <http://opensource.org/licenses/MIT>)

# Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in the work by you, as defined in the Apache-2.0 license, shall be dual licensed as above, without any additional terms or conditions.
