import { type Batch, Key, type KeyQuery, type KeyQueryFilter, type Pair, type Query, type QueryFilter, type Datastore } from 'interface-datastore'
import { BaseDatastore } from './base.js'
import * as Errors from './errors.js'
import { KeyTransformDatastore } from './keytransform.js'
import {
  readShardFun,
  SHARDING_FN
} from './shard.js'
import type { Shard } from './index.js'
import type { AbortOptions, AwaitIterable } from 'interface-store'

const shardKey = new Key(SHARDING_FN)

/**
 * Backend independent abstraction of go-ds-flatfs.
 *
 * Wraps another datastore such that all values are stored
 * sharded according to the given sharding function.
 */
export class ShardingDatastore extends BaseDatastore {
  private readonly child: KeyTransformDatastore
  private shard: Shard

  constructor (store: Datastore, shard: Shard) {
    super()

    this.child = new KeyTransformDatastore(store, {
      convert: this._convertKey.bind(this),
      invert: this._invertKey.bind(this)
    })
    this.shard = shard
  }

  async open (): Promise<void> {
    this.shard = await ShardingDatastore.create(this.child, this.shard)
  }

  _convertKey (key: Key): Key {
    const s = key.toString()
    if (s === shardKey.toString()) {
      return key
    }

    const parent = new Key(this.shard.fun(s))
    return parent.child(key)
  }

  _invertKey (key: Key): Key {
    const s = key.toString()
    if (s === shardKey.toString()) {
      return key
    }
    return Key.withNamespaces(key.list().slice(1))
  }

  static async create (store: Datastore, shard?: Shard): Promise<Shard> {
    const hasShard = await store.has(shardKey)

    if (!hasShard) {
      if (shard == null) {
        throw Errors.dbOpenFailedError(Error('Shard is required when datastore doesn\'t have a shard key already.'))
      }

      await store.put(shardKey, new TextEncoder().encode(shard.toString() + '\n'))
    }

    if (shard == null) {
      shard = await readShardFun('/', store)
    }

    // test shards
    const diskShard = await readShardFun('/', store)
    const a = diskShard.toString()
    const b = shard.toString()

    if (a !== b) {
      throw new Error(`specified fun ${b} does not match repo shard fun ${a}`)
    }

    return diskShard
  }

  async put (key: Key, val: Uint8Array, options?: AbortOptions): Promise<Key> {
    await this.child.put(key, val, options)

    return key
  }

  async get (key: Key, options?: AbortOptions): Promise<Uint8Array> {
    return this.child.get(key, options)
  }

  async has (key: Key, options?: AbortOptions): Promise<boolean> {
    return this.child.has(key, options)
  }

  async delete (key: Key, options?: AbortOptions): Promise<void> {
    await this.child.delete(key, options)
  }

  async * putMany (source: AwaitIterable<Pair>, options: AbortOptions = {}): AsyncIterable<Key> {
    yield * this.child.putMany(source, options)
  }

  async * getMany (source: AwaitIterable<Key>, options: AbortOptions = {}): AsyncIterable<Pair> {
    yield * this.child.getMany(source, options)
  }

  async * deleteMany (source: AwaitIterable<Key>, options: AbortOptions = {}): AsyncIterable<Key> {
    yield * this.child.deleteMany(source, options)
  }

  batch (): Batch {
    return this.child.batch()
  }

  query (q: Query, options?: AbortOptions): AsyncIterable<Pair> {
    const omitShard: QueryFilter = ({ key }) => key.toString() !== shardKey.toString()

    const tq: Query = {
      ...q,
      filters: [
        omitShard
      ].concat(q.filters ?? [])
    }

    return this.child.query(tq, options)
  }

  queryKeys (q: KeyQuery, options?: AbortOptions): AsyncIterable<Key> {
    const omitShard: KeyQueryFilter = (key) => key.toString() !== shardKey.toString()

    const tq: KeyQuery = {
      ...q,
      filters: [
        omitShard
      ].concat(q.filters ?? [])
    }

    return this.child.queryKeys(tq, options)
  }
}
