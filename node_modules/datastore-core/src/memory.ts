import { Key } from 'interface-datastore/key'
import { BaseDatastore } from './base.js'
import * as Errors from './errors.js'
import type { Pair } from 'interface-datastore'
import type { Await, AwaitIterable } from 'interface-store'

export class MemoryDatastore extends BaseDatastore {
  private readonly data: Map<string, Uint8Array>

  constructor () {
    super()

    this.data = new Map()
  }

  put (key: Key, val: Uint8Array): Await<Key> { // eslint-disable-line require-await
    this.data.set(key.toString(), val)

    return key
  }

  get (key: Key): Await<Uint8Array> {
    const result = this.data.get(key.toString())

    if (result == null) {
      throw Errors.notFoundError()
    }

    return result
  }

  has (key: Key): Await<boolean> { // eslint-disable-line require-await
    return this.data.has(key.toString())
  }

  delete (key: Key): Await<void> { // eslint-disable-line require-await
    this.data.delete(key.toString())
  }

  * _all (): AwaitIterable<Pair> {
    for (const [key, value] of this.data.entries()) {
      yield { key: new Key(key), value }
    }
  }

  * _allKeys (): AwaitIterable<Key> {
    for (const key of this.data.keys()) {
      yield new Key(key)
    }
  }
}
