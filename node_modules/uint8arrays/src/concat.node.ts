import { Buffer } from 'node:buffer'
import { asUint8Array } from '#util/as-uint8array'

/**
 * Returns a new Uint8Array created by concatenating the passed Uint8Arrays
 */
export function concat (arrays: Uint8Array[], length?: number): Uint8Array {
  return asUint8Array(Buffer.concat(arrays, length))
}
