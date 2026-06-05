import { logger } from '@libp2p/logger'
import drain from 'it-drain'
import { pushable } from 'it-pushable'
import { BaseDatastore } from './base.js'
import * as Errors from './errors.js'
import type { Batch, Datastore, Key, KeyQuery, Pair, Query } from 'interface-datastore'
import type { AbortOptions, AwaitIterable } from 'interface-store'

const log = logger('datastore:core:tiered')

/**
 * A datastore that can combine multiple stores. Puts and deletes
 * will write through to all datastores. Has and get will
 * try each store sequentially. Query will always try the
 * last one first.
 *
 */
export class TieredDatastore extends BaseDatastore {
  private readonly stores: Datastore[]

  constructor (stores: Datastore[]) {
    super()

    this.stores = stores.slice()
  }

  async put (key: Key, value: Uint8Array, options?: AbortOptions): Promise<Key> {
    try {
      await Promise.all(this.stores.map(async store => { await store.put(key, value, options) }))
      return key
    } catch (err: any) {
      throw Errors.dbWriteFailedError(err)
    }
  }

  async get (key: Key, options?: AbortOptions): Promise<Uint8Array> {
    for (const store of this.stores) {
      try {
        const res = await store.get(key, options)
        if (res != null) return res
      } catch (err) {
        log.error(err)
      }
    }
    throw Errors.notFoundError()
  }

  async has (key: Key, options?: AbortOptions): Promise<boolean> {
    for (const s of this.stores) {
      if (await s.has(key, options)) {
        return true
      }
    }

    return false
  }

  async delete (key: Key, options?: AbortOptions): Promise<void> {
    try {
      await Promise.all(this.stores.map(async store => { await store.delete(key, options) }))
    } catch (err: any) {
      throw Errors.dbDeleteFailedError(err)
    }
  }

  async * putMany (source: AwaitIterable<Pair>, options: AbortOptions = {}): AsyncIterable<Key> {
    let error: Error | undefined
    const pushables = this.stores.map(store => {
      const source = pushable<Pair>({
        objectMode: true
      })

      drain(store.putMany(source, options))
        .catch(err => {
          // store threw while putting, make sure we bubble the error up
          error = err
        })

      return source
    })

    try {
      for await (const pair of source) {
        if (error != null) {
          throw error
        }

        pushables.forEach(p => p.push(pair))

        yield pair.key
      }
    } finally {
      pushables.forEach(p => p.end())
    }
  }

  async * deleteMany (source: AwaitIterable<Key>, options: AbortOptions = {}): AsyncIterable<Key> {
    let error: Error | undefined
    const pushables = this.stores.map(store => {
      const source = pushable<Key>({
        objectMode: true
      })

      drain(store.deleteMany(source, options))
        .catch(err => {
          // store threw while deleting, make sure we bubble the error up
          error = err
        })

      return source
    })

    try {
      for await (const key of source) {
        if (error != null) {
          throw error
        }

        pushables.forEach(p => p.push(key))

        yield key
      }
    } finally {
      pushables.forEach(p => p.end())
    }
  }

  batch (): Batch {
    const batches = this.stores.map(store => store.batch())

    return {
      put: (key, value) => {
        batches.forEach(b => { b.put(key, value) })
      },
      delete: (key) => {
        batches.forEach(b => { b.delete(key) })
      },
      commit: async (options) => {
        for (const batch of batches) {
          await batch.commit(options)
        }
      }
    }
  }

  query (q: Query, options?: AbortOptions): AwaitIterable<Pair> {
    return this.stores[this.stores.length - 1].query(q, options)
  }

  queryKeys (q: KeyQuery, options?: AbortOptions): AwaitIterable<Key> {
    return this.stores[this.stores.length - 1].queryKeys(q, options)
  }
}
