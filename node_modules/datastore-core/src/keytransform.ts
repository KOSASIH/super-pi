import map from 'it-map'
import { pipe } from 'it-pipe'
import { BaseDatastore } from './base.js'
import type { KeyTransform } from './index.js'
import type { Batch, Datastore, Key, KeyQuery, Pair, Query } from 'interface-datastore'
import type { AbortOptions, AwaitIterable } from 'interface-store'

/**
 * A datastore shim, that wraps around a given datastore, changing
 * the way keys look to the user, for example namespacing
 * keys, reversing them, etc.
 */
export class KeyTransformDatastore extends BaseDatastore {
  private readonly child: Datastore
  public transform: KeyTransform

  constructor (child: Datastore, transform: KeyTransform) {
    super()

    this.child = child
    this.transform = transform
  }

  async put (key: Key, val: Uint8Array, options?: AbortOptions): Promise<Key> {
    await this.child.put(this.transform.convert(key), val, options)

    return key
  }

  async get (key: Key, options?: AbortOptions): Promise<Uint8Array> {
    return this.child.get(this.transform.convert(key), options)
  }

  async has (key: Key, options?: AbortOptions): Promise<boolean> {
    return this.child.has(this.transform.convert(key), options)
  }

  async delete (key: Key, options?: AbortOptions): Promise<void> {
    await this.child.delete(this.transform.convert(key), options)
  }

  async * putMany (source: AwaitIterable<Pair>, options: AbortOptions = {}): AsyncIterable<Key> {
    const transform = this.transform
    const child = this.child

    yield * pipe(
      source,
      async function * (source) {
        yield * map(source, ({ key, value }) => ({
          key: transform.convert(key),
          value
        }))
      },
      async function * (source) {
        yield * child.putMany(source, options)
      },
      async function * (source) {
        yield * map(source, key => transform.invert(key))
      }
    )
  }

  async * getMany (source: AwaitIterable<Key>, options: AbortOptions = {}): AsyncIterable<Pair> {
    const transform = this.transform
    const child = this.child

    yield * pipe(
      source,
      async function * (source) {
        yield * map(source, key => transform.convert(key))
      },
      async function * (source) {
        yield * child.getMany(source, options)
      },
      async function * (source) {
        yield * map(source, ({ key, value }) => ({
          key: transform.invert(key),
          value
        }))
      }
    )
  }

  async * deleteMany (source: AwaitIterable<Key>, options: AbortOptions = {}): AsyncIterable<Key> {
    const transform = this.transform
    const child = this.child

    yield * pipe(
      source,
      async function * (source) {
        yield * map(source, key => transform.convert(key))
      },
      async function * (source) {
        yield * child.deleteMany(source, options)
      },
      async function * (source) {
        yield * map(source, key => transform.invert(key))
      }
    )
  }

  batch (): Batch {
    const b = this.child.batch()
    return {
      put: (key, value) => {
        b.put(this.transform.convert(key), value)
      },
      delete: (key) => {
        b.delete(this.transform.convert(key))
      },
      commit: async (options) => {
        await b.commit(options)
      }
    }
  }

  query (q: Query, options?: AbortOptions): AsyncIterable<Pair> {
    const query: Query = {
      ...q
    }

    query.filters = (query.filters ?? []).map(filter => {
      return ({ key, value }) => filter({ key: this.transform.convert(key), value })
    })

    const { prefix } = q
    if (prefix != null && prefix !== '/') {
      delete query.prefix
      query.filters.push(({ key }) => {
        return this.transform.invert(key).toString().startsWith(prefix)
      })
    }

    if (query.orders != null) {
      query.orders = query.orders.map(order => {
        return (a, b) => order(
          { key: this.transform.invert(a.key), value: a.value },
          { key: this.transform.invert(b.key), value: b.value }
        )
      })
    }

    return map(this.child.query(query, options), ({ key, value }) => {
      return {
        key: this.transform.invert(key),
        value
      }
    })
  }

  queryKeys (q: KeyQuery, options?: AbortOptions): AsyncIterable<Key> {
    const query = {
      ...q
    }

    query.filters = (query.filters ?? []).map(filter => {
      return (key) => filter(this.transform.convert(key))
    })

    const { prefix } = q
    if (prefix != null && prefix !== '/') {
      delete query.prefix
      query.filters.push((key) => {
        return this.transform.invert(key).toString().startsWith(prefix)
      })
    }

    if (query.orders != null) {
      query.orders = query.orders.map(order => {
        return (a, b) => order(
          this.transform.invert(a),
          this.transform.invert(b)
        )
      })
    }

    return map(this.child.queryKeys(query, options), key => {
      return this.transform.invert(key)
    })
  }
}
