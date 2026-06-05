function isByteArrayWithArrayBuffer (b?: Uint8Array): b is Uint8Array<ArrayBuffer> {
  return b?.buffer instanceof ArrayBuffer
}

/**
 * To guarantee Uint8Array semantics, convert nodejs Buffers
 * into vanilla Uint8Arrays
 */
export function asUint8Array (buf: Uint8Array): Uint8Array<ArrayBuffer> {
  if (isByteArrayWithArrayBuffer(buf)) {
    return buf
  }

  const b = buf.slice()

  return new Uint8Array(b.buffer, 0, b.byteLength)
}
