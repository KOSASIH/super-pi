import { Buffer } from 'node:buffer'
import { asUint8Array } from '#util/as-uint8array'

/**
 * Returns a `Uint8Array` of the requested size. Referenced memory will
 * be initialized to 0.
 */
export function alloc (size: number = 0): Uint8Array {
  return asUint8Array(Buffer.alloc(size))
}

/**
 * Where possible returns a Uint8Array of the requested size that references
 * uninitialized memory. Only use if you are certain you will immediately
 * overwrite every value in the returned `Uint8Array`.
 */
export function allocUnsafe (size: number = 0): Uint8Array {
  return asUint8Array(Buffer.allocUnsafe(size))
}
