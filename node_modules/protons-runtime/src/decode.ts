import { createReader } from './utils/reader.js'
import type { Codec, DecodeOptions } from './codec.js'
import type { Uint8ArrayList } from 'uint8arraylist'

export function decodeMessage <T> (buf: Uint8Array | Uint8ArrayList, codec: Pick<Codec<T>, 'decode'>, opts?: DecodeOptions<T>): T {
  const reader = createReader(buf)

  return codec.decode(reader, undefined, opts)
}
