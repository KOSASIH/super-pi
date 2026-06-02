function isArrayBufferBacked (arr: Uint8Array): arr is Uint8Array<ArrayBuffer> {
  return arr.buffer instanceof ArrayBuffer
}

/**
 * If the passed `arr` is of type `Uint8Array<ArrayBuffer>`, it is returned
 * unchanged, otherwise a new `Uint8Array<ArrayBuffer>` is created with the
 * data being a copy of the data in the passed `arr`.
 */
export function withArrayBuffer (arr: Uint8Array): Uint8Array<ArrayBuffer> {
  if (isArrayBufferBacked(arr)) {
    return arr
  }

  return arr.slice()
}
