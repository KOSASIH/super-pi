import { decodeUint8Array, encodingLength } from 'uint8-varint'
import { readFloatLE, readDoubleLE } from './float.js'
import { LongBits } from './longbits.js'
import * as utf8 from './utf8.js'
import type { Reader } from '../index.js'
import type { Uint8ArrayList } from 'uint8arraylist'

/* istanbul ignore next */
function indexOutOfRange (reader: Reader, writeLength?: number): RangeError {
  return RangeError(`index out of range: ${reader.pos} + ${writeLength ?? 1} > ${reader.len}`)
}

function readFixed32End (buf: Uint8Array, end: number): number { // note that this uses `end`, not `pos`
  return (buf[end - 4] |
        buf[end - 3] << 8 |
        buf[end - 2] << 16 |
        buf[end - 1] << 24) >>> 0
}

/**
 * Constructs a new reader instance using the specified buffer.
 */
export class Uint8ArrayReader implements Reader {
  public buf: Uint8Array
  public pos: number
  public len: number

  public _slice = Uint8Array.prototype.subarray

  constructor (buffer: Uint8Array) {
    /**
     * Read buffer
     */
    this.buf = buffer

    /**
     * Read buffer position
     */
    this.pos = 0

    /**
     * Read buffer length
     */
    this.len = buffer.length
  }

  /**
   * Reads a varint as an unsigned 32 bit value
   */
  uint32 (): number {
    let value = 4294967295

    value = (this.buf[this.pos] & 127) >>> 0; if (this.buf[this.pos++] < 128) { return value }
    value = (value | (this.buf[this.pos] & 127) << 7) >>> 0; if (this.buf[this.pos++] < 128) { return value }
    value = (value | (this.buf[this.pos] & 127) << 14) >>> 0; if (this.buf[this.pos++] < 128) { return value }
    value = (value | (this.buf[this.pos] & 127) << 21) >>> 0; if (this.buf[this.pos++] < 128) { return value }
    value = (value | (this.buf[this.pos] & 15) << 28) >>> 0; if (this.buf[this.pos++] < 128) { return value }

    if ((this.pos += 5) > this.len) {
      this.pos = this.len
      throw indexOutOfRange(this, 10)
    }

    return value
  }

  /**
   * Reads a varint as a signed 32 bit value
   */
  int32 (): number {
    return this.uint32() | 0
  }

  /**
   * Reads a zig-zag encoded varint as a signed 32 bit value
   */
  sint32 (): number {
    const value = this.uint32()
    return value >>> 1 ^ -(value & 1) | 0
  }

  /**
   * Reads a varint as a boolean
   */
  bool (): boolean {
    return this.uint32() !== 0
  }

  /**
   * Reads fixed 32 bits as an unsigned 32 bit integer
   */
  fixed32 (): number {
    if (this.pos + 4 > this.len) { throw indexOutOfRange(this, 4) }

    const res = readFixed32End(this.buf, this.pos += 4)

    return res
  }

  /**
   * Reads fixed 32 bits as a signed 32 bit integer
   */
  sfixed32 (): number {
    if (this.pos + 4 > this.len) {
      throw indexOutOfRange(this, 4)
    }

    const res = readFixed32End(this.buf, this.pos += 4) | 0

    return res
  }

  /**
   * Reads a float (32 bit) as a number
   */
  float (): number {
    if (this.pos + 4 > this.len) {
      throw indexOutOfRange(this, 4)
    }

    const value = readFloatLE(this.buf, this.pos)
    this.pos += 4
    return value
  }

  /**
   * Reads a double (64 bit float) as a number
   */
  double (): number {
    /* istanbul ignore if */
    if (this.pos + 8 > this.len) { throw indexOutOfRange(this, 4) }

    const value = readDoubleLE(this.buf, this.pos)
    this.pos += 8
    return value
  }

  /**
   * Reads a sequence of bytes preceded by its length as a varint
   */
  bytes (): Uint8Array {
    const length = this.uint32()
    const start = this.pos
    const end = this.pos + length

    /* istanbul ignore if */
    if (end > this.len) {
      throw indexOutOfRange(this, length)
    }

    this.pos += length

    return start === end // fix for IE 10/Win8 and others' subarray returning array of size 1
      ? new Uint8Array(0)
      : this.buf.subarray(start, end)
  }

  /**
   * Reads a string preceded by its byte length as a varint
   */
  string (): string {
    const bytes = this.bytes()
    return utf8.read(bytes, 0, bytes.length)
  }

  /**
   * Skips the specified number of bytes if specified, otherwise skips a varint
   */
  skip (length?: number): this {
    if (typeof length === 'number') {
      /* istanbul ignore if */
      if (this.pos + length > this.len) { throw indexOutOfRange(this, length) }
      this.pos += length
    } else {
      do {
        /* istanbul ignore if */
        if (this.pos >= this.len) {
          throw indexOutOfRange(this)
        }
      } while ((this.buf[this.pos++] & 128) !== 0)
    }
    return this
  }

  /**
   * Skips the next element of the specified wire type
   */
  skipType (wireType: number): this {
    switch (wireType) {
      case 0:
        this.skip()
        break
      case 1:
        this.skip(8)
        break
      case 2:
        this.skip(this.uint32())
        break
      case 3:
        while ((wireType = this.uint32() & 7) !== 4) {
          this.skipType(wireType)
        }
        break
      case 5:
        this.skip(4)
        break

        /* istanbul ignore next */
      default:
        throw Error(`invalid wire type ${wireType} at offset ${this.pos}`)
    }
    return this
  }

  private readLongVarint (): LongBits {
    // tends to deopt with local vars for octet etc.
    const bits = new LongBits(0, 0)
    let i = 0
    if (this.len - this.pos > 4) { // fast route (lo)
      for (; i < 4; ++i) {
        // 1st..4th
        bits.lo = (bits.lo | (this.buf[this.pos] & 127) << i * 7) >>> 0
        if (this.buf[this.pos++] < 128) { return bits }
      }
      // 5th
      bits.lo = (bits.lo | (this.buf[this.pos] & 127) << 28) >>> 0
      bits.hi = (bits.hi | (this.buf[this.pos] & 127) >> 4) >>> 0
      if (this.buf[this.pos++] < 128) { return bits }
      i = 0
    } else {
      for (; i < 3; ++i) {
        /* istanbul ignore if */
        if (this.pos >= this.len) { throw indexOutOfRange(this) }
        // 1st..3th
        bits.lo = (bits.lo | (this.buf[this.pos] & 127) << i * 7) >>> 0
        if (this.buf[this.pos++] < 128) { return bits }
      }
      // 4th
      bits.lo = (bits.lo | (this.buf[this.pos++] & 127) << i * 7) >>> 0
      return bits
    }
    if (this.len - this.pos > 4) { // fast route (hi)
      for (; i < 5; ++i) {
        // 6th..10th
        bits.hi = (bits.hi | (this.buf[this.pos] & 127) << i * 7 + 3) >>> 0
        if (this.buf[this.pos++] < 128) { return bits }
      }
    } else {
      for (; i < 5; ++i) {
        if (this.pos >= this.len) {
          throw indexOutOfRange(this)
        }

        // 6th..10th
        bits.hi = (bits.hi | (this.buf[this.pos] & 127) << i * 7 + 3) >>> 0
        if (this.buf[this.pos++] < 128) { return bits }
      }
    }

    throw Error('invalid varint encoding')
  }

  private readFixed64 (): LongBits {
    if (this.pos + 8 > this.len) {
      throw indexOutOfRange(this, 8)
    }

    const lo = readFixed32End(this.buf, this.pos += 4)
    const hi = readFixed32End(this.buf, this.pos += 4)

    return new LongBits(lo, hi)
  }

  /**
   * Reads a varint as a signed 64 bit value
   */
  int64 (): bigint {
    return this.readLongVarint().toBigInt()
  }

  /**
   * Reads a varint as a signed 64 bit value returned as a possibly unsafe
   * JavaScript number
   */
  int64Number (): number {
    return this.readLongVarint().toNumber()
  }

  /**
   * Reads a varint as a signed 64 bit value returned as a string
   */
  int64String (): string {
    return this.readLongVarint().toString()
  }

  /**
   * Reads a varint as an unsigned 64 bit value
   */
  uint64 (): bigint {
    return this.readLongVarint().toBigInt(true)
  }

  /**
   * Reads a varint as an unsigned 64 bit value returned as a possibly unsafe
   * JavaScript number
   */
  uint64Number (): number {
    const value = decodeUint8Array(this.buf, this.pos)
    this.pos += encodingLength(value)
    return value
  }

  /**
   * Reads a varint as an unsigned 64 bit value returned as a string
   */
  uint64String (): string {
    return this.readLongVarint().toString(true)
  }

  /**
   * Reads a zig-zag encoded varint as a signed 64 bit value
   */
  sint64 (): bigint {
    return this.readLongVarint().zzDecode().toBigInt()
  }

  /**
   * Reads a zig-zag encoded varint as a signed 64 bit value returned as a
   * possibly unsafe JavaScript number
   */
  sint64Number (): number {
    return this.readLongVarint().zzDecode().toNumber()
  }

  /**
   * Reads a zig-zag encoded varint as a signed 64 bit value returned as a
   * string
   */
  sint64String (): string {
    return this.readLongVarint().zzDecode().toString()
  }

  /**
   * Reads fixed 64 bits
   */
  fixed64 (): bigint {
    return this.readFixed64().toBigInt()
  }

  /**
   * Reads fixed 64 bits returned as a possibly unsafe JavaScript number
   */
  fixed64Number (): number {
    return this.readFixed64().toNumber()
  }

  /**
   * Reads fixed 64 bits returned as a string
   */
  fixed64String (): string {
    return this.readFixed64().toString()
  }

  /**
   * Reads zig-zag encoded fixed 64 bits
   */
  sfixed64 (): bigint {
    return this.readFixed64().toBigInt()
  }

  /**
   * Reads zig-zag encoded fixed 64 bits returned as a possibly unsafe
   * JavaScript number
   */
  sfixed64Number (): number {
    return this.readFixed64().toNumber()
  }

  /**
   * Reads zig-zag encoded fixed 64 bits returned as a string
   */
  sfixed64String (): string {
    return this.readFixed64().toString()
  }
}

export function createReader (buf: Uint8Array | Uint8ArrayList): Reader {
  return new Uint8ArrayReader(buf instanceof Uint8Array ? buf : buf.subarray())
}
