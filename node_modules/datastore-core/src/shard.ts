import { Key } from 'interface-datastore/key'
import type { Shard } from './index.js'
import type { Datastore } from 'interface-datastore'

export const PREFIX = '/repo/flatfs/shard/'
export const SHARDING_FN = 'SHARDING'

export class ShardBase implements Shard {
  public param: number
  public name: string
  public _padding: string

  constructor (param: number) {
    this.param = param
    this.name = 'base'
    this._padding = ''
  }

  fun (s: string): string {
    return 'implement me'
  }

  toString (): string {
    return `${PREFIX}v1/${this.name}/${this.param}`
  }
}

export class Prefix extends ShardBase {
  constructor (prefixLen: number) {
    super(prefixLen)
    this._padding = ''.padStart(prefixLen, '_')
    this.name = 'prefix'
  }

  fun (noslash: string): string {
    return (noslash + this._padding).slice(0, this.param)
  }
}

export class Suffix extends ShardBase {
  constructor (suffixLen: number) {
    super(suffixLen)

    this._padding = ''.padStart(suffixLen, '_')
    this.name = 'suffix'
  }

  fun (noslash: string): string {
    const s = this._padding + noslash
    return s.slice(s.length - this.param)
  }
}

export class NextToLast extends ShardBase {
  constructor (suffixLen: number) {
    super(suffixLen)
    this._padding = ''.padStart(suffixLen + 1, '_')
    this.name = 'next-to-last'
  }

  fun (noslash: string): string {
    const s = this._padding + noslash
    const offset = s.length - this.param - 1
    return s.slice(offset, offset + this.param)
  }
}

/**
 * Convert a given string to the matching sharding function
 */
export function parseShardFun (str: string): Shard {
  str = str.trim()

  if (str.length === 0) {
    throw new Error('empty shard string')
  }

  if (!str.startsWith(PREFIX)) {
    throw new Error(`invalid or no path prefix: ${str}`)
  }

  const parts = str.slice(PREFIX.length).split('/')
  const version = parts[0]

  if (version !== 'v1') {
    throw new Error(`expect 'v1' version, got '${version}'`)
  }

  const name = parts[1]

  if (parts[2] == null || parts[2] === '') {
    throw new Error('missing param')
  }

  const param = parseInt(parts[2], 10)

  switch (name) {
    case 'prefix':
      return new Prefix(param)
    case 'suffix':
      return new Suffix(param)
    case 'next-to-last':
      return new NextToLast(param)
    default:
      throw new Error(`unkown sharding function: ${name}`)
  }
}

export const readShardFun = async (path: string | Uint8Array, store: Datastore): Promise<Shard> => {
  const key = new Key(path).child(new Key(SHARDING_FN))
  // @ts-expect-error not all stores have this
  const get = typeof store.getRaw === 'function' ? store.getRaw.bind(store) : store.get.bind(store)
  const res = await get(key)
  return parseShardFun(new TextDecoder().decode(res ?? '').trim())
}
