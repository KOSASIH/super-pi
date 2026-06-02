import { BaseDatastore } from './base.js'
import * as Errors from './errors.js'
import type { Pair } from 'interface-datastore'
import type { Key } from 'interface-datastore/key'
import type { Await, AwaitIterable } from 'interface-store'

export class BlackHoleDatastore extends BaseDatastore {
  put (key: Key): Await<Key> {
    return key
  }

  get (): Await<Uint8Array> {
    throw Errors.notFoundError()
  }

  has (key: Key): Await<boolean> {
    return false
  }

  delete (key: Key): Await<void> {

  }

  * _all (): AwaitIterable<Pair> {

  }

  * _allKeys (): AwaitIterable<Key> {

  }
}
