# interface-datastore

[![ipfs.tech](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](https://ipfs.tech)
[![Discuss](https://img.shields.io/discourse/https/discuss.ipfs.tech/posts.svg?style=flat-square)](https://discuss.ipfs.tech)
[![codecov](https://img.shields.io/codecov/c/github/ipfs/js-stores.svg?style=flat-square)](https://codecov.io/gh/ipfs/js-stores)
[![CI](https://img.shields.io/github/actions/workflow/status/ipfs/js-stores/js-test-and-release.yml?branch=main\&style=flat-square)](https://github.com/ipfs/js-stores/actions/workflows/js-test-and-release.yml?query=branch%3Amain)

> datastore interface

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

A Datastore is a key/value database that lets store/retrieve binary blobs using namespaced Keys.

It is used by IPFS to store/retrieve arbitrary metadata needed to run the node - DHT provider records, signed peer records, etc.

## Backed Implementations

- File System: [`datastore-fs`](https://github.com/ipfs/js-stores/tree/main/packages/datastore-fs)
- IndexedDB: [`datastore-idb`](https://github.com/ipfs/js-stores/blob/main/packages/datastore-idb)
- level: [`datastore-level`](https://github.com/ipfs/js-stores/tree/main/packages/datastore-level) (supports any levelup compatible backend)
- Memory: [`datastore-core/memory`](https://github.com/ipfs/js-stores/blob/main/packages/datastore-core/src/memory.ts)
- S3: [`datastore-s3`](https://github.com/ipfs/js-stores/tree/main/packages/datastore-s3)

## Wrapper Implementations

- Keytransform: [`datstore-core/src/keytransform`](https://github.com/ipfs/js-stores/blob/main/packages/datastore-core/src/keytransform.ts)
- Mount: [`datastore-core/src/mount`](https://github.com/ipfs/js-stores/blob/main/packages/datastore-core/src/mount.ts)
- Namespace: [`datastore-core/src/namespace`](https://github.com/ipfs/js-stores/blob/main/packages/datastore-core/src/namespace.ts)
- Sharding: [`datastore-core/src/sharding`](https://github.com/ipfs/js-stores/blob/main/packages/datastore-core/src/sharding.ts)
- Tiered: [`datstore-core/src/tiered`](https://github.com/ipfs/js-stores/blob/main/packages/datastore-core/src/tiered.ts)

If you want the same functionality as [go-ds-flatfs](https://github.com/ipfs/go-ds-flatfs), use sharding with fs.

## Example

```js
import FsStore from 'datastore-fs'
import { ShardingDataStore, shard } from 'datastore-core'

const fs = new FsStore('path/to/store')

// flatfs now works like go-flatfs
const flatfs = await ShardingStore.createOrOpen(fs, new shard.NextToLast(2))
```

### Test suite

Available via the [`interface-datastore-tests`](https://npmjs.com/package/interface-datastore-tests) module

```js
import { interfaceDatastoreTests } from 'interface-datastore-tests'

describe('mystore', () => {
  interfaceDatastoreTests({
    async setup () {
      return instanceOfMyStore
    },
    async teardown () {
      // cleanup resources
    }
  })
})
```

### Aborting requests

Most API methods accept an \[AbortSignal]\[] as part of an options object.  Implementations may listen for an `abort` event emitted by this object, or test the `signal.aborted` property. When received implementations should tear down any long-lived requests or resources created.

### Concurrency

The streaming `(put|get|delete)Many` methods are intended to be used with modules such as [it-parallel-batch](https://www.npmjs.com/package/it-parallel-batch) to allow calling code to control levels of parallelisation.  The batching method ensures results are returned in the correct order, but interface implementations should be thread safe.

```js
import batch from 'it-parallel-batch'
const source = [{
  key: ..,
  value: ..
}]

// put values into the datastore concurrently, max 10 at a time
for await (const { key, data } of batch(store.putMany(source), 10)) {
  console.info(`Put ${key}`)
}
```

### Keys

To allow a better abstraction on how to address values, there is a `Key` class which is used as identifier. It's easy to create a key from a `Uint8Array` or a `string`.

```js
const a = new Key('a')
const b = new Key(new Uint8Array([0, 1, 2, 3]))
```

The key scheme is inspired by file systems and Google App Engine key model. Keys are meant to be unique across a system. They are typically hierarchical, incorporating more and more specific namespaces. Thus keys can be deemed 'children' or 'ancestors' of other keys:

- `new Key('/Comedy')`
- `new Key('/Comedy/MontyPython')`

Also, every namespace can be parameterized to embed relevant object information. For example, the Key `name` (most specific namespace) could include the object type:

- `new Key('/Comedy/MontyPython/Actor:JohnCleese')`
- `new Key('/Comedy/MontyPython/Sketch:CheeseShop')`
- `new Key('/Comedy/MontyPython/Sketch:CheeseShop/Character:Mousebender')`

# Install

```console
$ npm i interface-datastore
```

## Browser `<script>` tag

Loading this module through a script tag will make its exports available as `InterfaceDatastore` in the global namespace.

```html
<script src="https://unpkg.com/interface-datastore/dist/index.min.js"></script>
```

# API Docs

- <https://ipfs.github.io/js-stores/modules/interface_datastore.html>

# License

Licensed under either of

- Apache 2.0, ([LICENSE-APACHE](https://github.com/ipfs/js-stores/blob/main/packages/interface-datastore/LICENSE-APACHE) / <http://www.apache.org/licenses/LICENSE-2.0>)
- MIT ([LICENSE-MIT](https://github.com/ipfs/js-stores/blob/main/packages/interface-datastore/LICENSE-MIT) / <http://opensource.org/licenses/MIT>)

# Contribute

Contributions welcome! Please check out [the issues](https://github.com/ipfs/js-stores/issues).

Also see our [contributing document](https://github.com/ipfs/community/blob/master/CONTRIBUTING_JS.md) for more information on how we work, and about contributing in general.

Please be aware that all interactions related to this repo are subject to the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in the work by you, as defined in the Apache-2.0 license, shall be dual licensed as above, without any additional terms or conditions.

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/CONTRIBUTING.md)
