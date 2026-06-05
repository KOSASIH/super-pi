/**
 * To guarantee Uint8Array semantics, convert nodejs Buffers
 * into vanilla Uint8Arrays
 */
export function asUint8Array (buf: Uint8Array): Uint8Array<ArrayBuffer> {
  if (buf.buffer instanceof ArrayBuffer) {
    return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength)
  }

  const b = buf.slice()

  return new Uint8Array(b.buffer, 0, b.byteLength)
}
