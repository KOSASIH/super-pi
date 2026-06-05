# @multiformats/dns

[![multiformats.io](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://multiformats.io)
[![codecov](https://img.shields.io/codecov/c/github/multiformats/js-dns.svg?style=flat-square)](https://codecov.io/gh/multiformats/js-dns)
[![CI](https://img.shields.io/github/actions/workflow/status/multiformats/js-dns/js-test-and-release.yml?branch=main\&style=flat-square)](https://github.com/multiformats/js-dns/actions/workflows/js-test-and-release.yml?query=branch%3Amain)

> Resolve DNS queries with browser fallback

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

Query DNS records using `node:dns`, DNS over HTTP and/or DNSJSON over HTTP.

A list of publicly accessible servers can be found [here](https://github.com/curl/curl/wiki/DNS-over-HTTPS#publicly-available-servers).

## Example - Using the default resolver

```TypeScript
import { dns } from '@multiformats/dns'

const resolver = dns()

// resolve A records with a 5s timeout
const result = await dns.query('google.com', {
  signal: AbortSignal.timeout(5000)
})
```

## Example - Using per-TLD resolvers

```TypeScript
import { dns } from '@multiformats/dns'
import { dnsJsonOverHttps } from '@multiformats/dns/resolvers'

const resolver = dns({
  resolvers: {
    // will only be used to resolve `.com` addresses
    'com.': dnsJsonOverHttps('https://cloudflare-dns.com/dns-query'),

    // this can also be an array, resolvers will be shuffled and tried in
    // series
    'net.': [
      dnsJsonOverHttps('https://dns.google/resolve'),
      dnsJsonOverHttps('https://dns.pub/dns-query')
    ],

    // will only be used to resolve all other addresses
    '.': dnsJsonOverHttps('https://dnsforge.de/dns-query'),
  }
})
```

## Example - Query for specific record types

```TypeScript
import { dns, RecordType } from '@multiformats/dns'

const resolver = dns()

// resolve only TXT records
const result = await dns.query('google.com', {
  types: [
    RecordType.TXT
  ]
})
```

## Caching

Individual Aanswers are cached so. If you make a request, for which all
record types are cached, all values will be pulled from the cache.

If any of the record types are not cached, a new request will be resolved as
if none of the records were cached, and the cache will be updated to include
the new results.

## Example - Ignoring the cache

```TypeScript
import { dns, RecordType } from '@multiformats/dns'

const resolver = dns()

// do not used cached results, always resolve a new query
const result = await dns.query('google.com', {
  cached: false
})
```

# Install

```console
$ npm i @multiformats/dns
```

## Browser `<script>` tag

Loading this module through a script tag will make its exports available as `MultiformatsDns` in the global namespace.

```html
<script src="https://unpkg.com/@multiformats/dns/dist/index.min.js"></script>
```

# API Docs

- <https://multiformats.github.io/js-dns>

# License

Licensed under either of

- Apache 2.0, ([LICENSE-APACHE](https://github.com/multiformats/js-dns/LICENSE-APACHE) / <http://www.apache.org/licenses/LICENSE-2.0>)
- MIT ([LICENSE-MIT](https://github.com/multiformats/js-dns/LICENSE-MIT) / <http://opensource.org/licenses/MIT>)

# Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in the work by you, as defined in the Apache-2.0 license, shall be dual licensed as above, without any additional terms or conditions.
