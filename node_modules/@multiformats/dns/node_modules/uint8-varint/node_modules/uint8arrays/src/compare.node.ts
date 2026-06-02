import { Buffer } from 'node:buffer'

/**
 * Can be used with Array.sort to sort and array with Uint8Array entries
 */
export function compare (a: Uint8Array, b: Uint8Array): number {
  return Buffer.compare(a, b)
}
