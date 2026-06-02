import { createWriter } from './utils/writer.js'
import type { Codec } from './codec.js'

export function encodeMessage <T> (message: Partial<T>, codec: Pick<Codec<T>, 'encode'>): Uint8Array {
  const w = createWriter()

  codec.encode(message, w, {
    lengthDelimited: false
  })

  return w.finish()
}
