import bases from './util/bases.ts'
import type { SupportedEncodings } from './util/bases.ts'

export type { SupportedEncodings }

/**
 * Turns a `Uint8Array` into a string.
 *
 * Supports `utf8`, `utf-8` and any encoding supported by the multibase module.
 *
 * Also `ascii` which is similar to node's 'binary' encoding.
 */
export function toString (array: Uint8Array, encoding: SupportedEncodings = 'utf8'): string {
  const base = bases[encoding]

  if (base == null) {
    throw new Error(`Unsupported encoding "${encoding}"`)
  }

  // strip multibase prefix
  return base.encoder.encode(array).substring(1)
}
