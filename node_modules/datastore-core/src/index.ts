/**
 * @packageDocumentation
 *
 * Various Datastore implementations are available.
 *
 * ## Implementations
 *
 * - Mount: [`src/mount`](src/mount.ts)
 * - Keytransform: [`src/keytransform`](src/keytransform.ts)
 * - Sharding: [`src/sharding`](src/sharding.ts)
 * - Tiered: [`src/tiered`](src/tirered.ts)
 * - Namespace: [`src/namespace`](src/namespace.ts)
 * - BlackHole: [`src/black-hole`](src/black-hole.ts)
 *
 * @example BaseDatastore
 *
 * An base store is made available to make implementing your own datastore easier:
 *
 * ```javascript
 * import { BaseDatastore } from 'datastore-core'
 *
 * class MyDatastore extends BaseDatastore {
 *   constructor () {
 *     super()
 *   }
 *
 *   async put (key, val) {
 *     // your implementation here
 *   }
 *
 *   async get (key) {
 *     // your implementation here
 *   }
 *
 *   // etc...
 * }
 * ```
 *
 * See the [MemoryDatastore](./src/memory.js) for an example of how it is used.
 *
 * @example Wrapping Stores
 *
 * ```js
 * import { Key } from 'interface-datastore'
 * import {
 *   MemoryStore,
 *   MountStore
 * } from 'datastore-core'
 *
 * const store = new MountStore({prefix: new Key('/a'), datastore: new MemoryStore()})
 * ```
 *
 * @example BlackHoleDatastore
 *
 * A datastore that does not store any data.
 *
 * ```js
 * import { BlackHoleDatastore } from 'datastore-core/black-hole'
 *
 * const store = new BlackHoleDatastore()
 * ```
 */

import * as Errors from './errors.js'
import * as shard from './shard.js'
import type { Key } from 'interface-datastore'

export { BaseDatastore } from './base.js'
export { MemoryDatastore } from './memory.js'
export { KeyTransformDatastore } from './keytransform.js'
export { ShardingDatastore } from './sharding.js'
export { MountDatastore } from './mount.js'
export { TieredDatastore } from './tiered.js'
export { NamespaceDatastore } from './namespace.js'

export { Errors }
export { shard }

export interface Shard {
  name: string
  param: number
  readonly _padding: string
  fun(s: string): string
  toString(): string
}

export interface KeyTransform {
  convert(key: Key): Key
  invert(key: Key): Key
}
