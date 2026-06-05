/**
 * To guarantee Uint8Array semantics, convert nodejs Buffers
 * into vanilla Uint8Arrays
 */
export function asUint8Array (buf: Uint8Array): Uint8Array {
  return buf
}
