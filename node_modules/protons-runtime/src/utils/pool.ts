import { allocUnsafe } from 'uint8arrays/alloc'

/**
 * A general purpose buffer pool
 */
export default function pool (size?: number): (size: number) => Uint8Array {
  const SIZE = size ?? 8192
  const MAX = SIZE >>> 1
  let slab: Uint8Array
  let offset = SIZE
  return function poolAlloc (size: number) {
    if (size < 1 || size > MAX) {
      return allocUnsafe(size)
    }

    if (offset + size > SIZE) {
      slab = allocUnsafe(SIZE)
      offset = 0
    }

    const buf = slab.subarray(offset, offset += size)

    if ((offset & 7) !== 0) {
      // align to 32 bit
      offset = (offset | 7) + 1
    }

    return buf
  }
}
