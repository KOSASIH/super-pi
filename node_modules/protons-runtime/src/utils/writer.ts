import { encodeUint8Array, encodingLength } from 'uint8-varint'
import { allocUnsafe } from 'uint8arrays/alloc'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { writeFloatLE, writeDoubleLE } from './float.js'
import { LongBits } from './longbits.js'
import pool from './pool.js'
import * as utf8 from './utf8.js'
import type { Writer } from '../index.js'

interface WriterOperation<T> {
  (val: T, buf: Uint8Array, pos: number): any
}

/**
 * Constructs a new writer operation instance.
 *
 * @classdesc Scheduled writer operation
 */
class Op<T> {
  /**
   * Function to call
   */
  public fn: WriterOperation<T>

  /**
   * Value byte length
   */
  public len: number

  /**
   * Next operation
   */
  public next?: Op<any>

  /**
   * Value to write
   */
  public val: T

  constructor (fn: WriterOperation<T>, len: number, val: T) {
    this.fn = fn
    this.len = len
    this.next = undefined
    this.val = val // type varies
  }
}

/* istanbul ignore next */
function noop (): void {}

/**
 * Constructs a new writer state instance
 */
class State {
  /**
   * Current head
   */
  public head: Op<any>

  /**
   * Current tail
   */
  public tail: Op<any>

  /**
   * Current buffer length
   */
  public len: number

  /**
   * Next state
   */
  public next?: State

  constructor (writer: Uint8ArrayWriter) {
    this.head = writer.head
    this.tail = writer.tail
    this.len = writer.len
    this.next = writer.states
  }
}

const bufferPool = pool()

/**
 * Allocates a buffer of the specified size
 */
function alloc (size: number): Uint8Array {
  if (globalThis.Buffer != null) {
    return allocUnsafe(size)
  }

  return bufferPool(size)
}

/**
 * When a value is written, the writer calculates its byte length and puts it into a linked
 * list of operations to perform when finish() is called. This both allows us to allocate
 * buffers of the exact required size and reduces the amount of work we have to do compared
 * to first calculating over objects and then encoding over objects. In our case, the encoding
 * part is just a linked list walk calling operations with already prepared values.
 */
class Uint8ArrayWriter implements Writer {
  /**
   * Current length
   */
  public len: number

  /**
   * Operations head
   */
  public head: Op<any>

  /**
   * Operations tail
   */
  public tail: Op<any>

  /**
   * Linked forked states
   */
  public states?: any

  constructor () {
    this.len = 0
    this.head = new Op(noop, 0, 0)
    this.tail = this.head
    this.states = null
  }

  /**
   * Pushes a new operation to the queue
   */
  _push (fn: WriterOperation<any>, len: number, val: any): this {
    this.tail = this.tail.next = new Op(fn, len, val)
    this.len += len

    return this
  }

  /**
   * Writes an unsigned 32 bit value as a varint
   */
  uint32 (value: number): this {
    // here, the call to this.push has been inlined and a varint specific Op subclass is used.
    // uint32 is by far the most frequently used operation and benefits significantly from this.
    this.len += (this.tail = this.tail.next = new VarintOp(
      (value = value >>> 0) <
                128
        ? 1
        : value < 16384
          ? 2
          : value < 2097152
            ? 3
            : value < 268435456
              ? 4
              : 5,
      value)).len
    return this
  }

  /**
   * Writes a signed 32 bit value as a varint`
   */
  int32 (value: number): this {
    return value < 0
      ? this._push(writeVarint64, 10, LongBits.fromNumber(value)) // 10 bytes per spec
      : this.uint32(value)
  }

  /**
   * Writes a 32 bit value as a varint, zig-zag encoded
   */
  sint32 (value: number): this {
    return this.uint32((value << 1 ^ value >> 31) >>> 0)
  }

  /**
   * Writes an unsigned 64 bit value as a varint
   */
  uint64 (value: bigint): this {
    const bits = LongBits.fromBigInt(value)
    return this._push(writeVarint64, bits.length(), bits)
  }

  /**
   * Writes an unsigned 64 bit value as a varint
   */
  uint64Number (value: number): this {
    return this._push(encodeUint8Array, encodingLength(value), value)
  }

  /**
   * Writes an unsigned 64 bit value as a varint
   */
  uint64String (value: string): this {
    return this.uint64(BigInt(value))
  }

  /**
   * Writes a signed 64 bit value as a varint
   */
  int64 (value: bigint): this {
    return this.uint64(value)
  }

  /**
   * Writes a signed 64 bit value as a varint
   */
  int64Number (value: number): this {
    return this.uint64Number(value)
  }

  /**
   * Writes a signed 64 bit value as a varint
   */
  int64String (value: string): this {
    return this.uint64String(value)
  }

  /**
   * Writes a signed 64 bit value as a varint, zig-zag encoded
   */
  sint64 (value: bigint): this {
    const bits = LongBits.fromBigInt(value).zzEncode()
    return this._push(writeVarint64, bits.length(), bits)
  }

  /**
   * Writes a signed 64 bit value as a varint, zig-zag encoded
   */
  sint64Number (value: number): this {
    const bits = LongBits.fromNumber(value).zzEncode()
    return this._push(writeVarint64, bits.length(), bits)
  }

  /**
   * Writes a signed 64 bit value as a varint, zig-zag encoded
   */
  sint64String (value: string): this {
    return this.sint64(BigInt(value))
  }

  /**
   * Writes a boolish value as a varint
   */
  bool (value: boolean): this {
    return this._push(writeByte, 1, value ? 1 : 0)
  }

  /**
   * Writes an unsigned 32 bit value as fixed 32 bits
   */
  fixed32 (value: number): this {
    return this._push(writeFixed32, 4, value >>> 0)
  }

  /**
   * Writes a signed 32 bit value as fixed 32 bits
   */
  sfixed32 (value: number): this {
    return this.fixed32(value)
  }

  /**
   * Writes an unsigned 64 bit value as fixed 64 bits
   */
  fixed64 (value: bigint): this {
    const bits = LongBits.fromBigInt(value)
    return this._push(writeFixed32, 4, bits.lo)._push(writeFixed32, 4, bits.hi)
  }

  /**
   * Writes an unsigned 64 bit value as fixed 64 bits
   */
  fixed64Number (value: number): this {
    const bits = LongBits.fromNumber(value)
    return this._push(writeFixed32, 4, bits.lo)._push(writeFixed32, 4, bits.hi)
  }

  /**
   * Writes an unsigned 64 bit value as fixed 64 bits
   */
  fixed64String (value: string): this {
    return this.fixed64(BigInt(value))
  }

  /**
   * Writes a signed 64 bit value as fixed 64 bits
   */
  sfixed64 (value: bigint): this {
    return this.fixed64(value)
  }

  /**
   * Writes a signed 64 bit value as fixed 64 bits
   */
  sfixed64Number (value: number): this {
    return this.fixed64Number(value)
  }

  /**
   * Writes a signed 64 bit value as fixed 64 bits
   */
  sfixed64String (value: string): this {
    return this.fixed64String(value)
  }

  /**
   * Writes a float (32 bit)
   */
  float (value: number): this {
    return this._push(writeFloatLE, 4, value)
  }

  /**
   * Writes a double (64 bit float).
   *
   * @function
   * @param {number} value - Value to write
   * @returns {Writer} `this`
   */
  double (value: number): this {
    return this._push(writeDoubleLE, 8, value)
  }

  /**
   * Writes a sequence of bytes
   */
  bytes (value: Uint8Array): this {
    const len = value.length >>> 0

    if (len === 0) {
      return this._push(writeByte, 1, 0)
    }

    return this.uint32(len)._push(writeBytes, len, value)
  }

  /**
   * Writes a string
   */
  string (value: string): this {
    const len = utf8.length(value)
    return len !== 0
      ? this.uint32(len)._push(utf8.write, len, value)
      : this._push(writeByte, 1, 0)
  }

  /**
   * Forks this writer's state by pushing it to a stack.
   * Calling {@link Writer#reset|reset} or {@link Writer#ldelim|ldelim} resets the writer to the previous state.
   */
  fork (): this {
    this.states = new State(this)
    this.head = this.tail = new Op(noop, 0, 0)
    this.len = 0
    return this
  }

  /**
   * Resets this instance to the last state
   */
  reset (): this {
    if (this.states != null) {
      this.head = this.states.head
      this.tail = this.states.tail
      this.len = this.states.len
      this.states = this.states.next
    } else {
      this.head = this.tail = new Op(noop, 0, 0)
      this.len = 0
    }
    return this
  }

  /**
   * Resets to the last state and appends the fork state's current write length as a varint followed by its operations.
   */
  ldelim (): this {
    const head = this.head
    const tail = this.tail
    const len = this.len
    this.reset().uint32(len)
    if (len !== 0) {
      this.tail.next = head.next // skip noop
      this.tail = tail
      this.len += len
    }
    return this
  }

  /**
   * Finishes the write operation
   */
  finish (): Uint8Array {
    let head = this.head.next // skip noop
    const buf = alloc(this.len)
    let pos = 0
    while (head != null) {
      head.fn(head.val, buf, pos)
      pos += head.len
      head = head.next
    }
    // this.head = this.tail = null;
    return buf
  }
}

function writeByte (val: number, buf: Uint8Array, pos: number): void {
  buf[pos] = val & 255
}

function writeVarint32 (val: number, buf: Uint8Array, pos: number): void {
  while (val > 127) {
    buf[pos++] = val & 127 | 128
    val >>>= 7
  }
  buf[pos] = val
}

/**
 * Constructs a new varint writer operation instance.
 *
 * @classdesc Scheduled varint writer operation
 */
class VarintOp extends Op<number> {
  public next?: Op<any>

  constructor (len: number, val: number) {
    super(writeVarint32, len, val)
    this.next = undefined
  }
}

function writeVarint64 (val: LongBits, buf: Uint8Array, pos: number): void {
  while (val.hi !== 0) {
    buf[pos++] = val.lo & 127 | 128
    val.lo = (val.lo >>> 7 | val.hi << 25) >>> 0
    val.hi >>>= 7
  }
  while (val.lo > 127) {
    buf[pos++] = val.lo & 127 | 128
    val.lo = val.lo >>> 7
  }
  buf[pos++] = val.lo
}

function writeFixed32 (val: number, buf: Uint8Array, pos: number): void {
  buf[pos] = val & 255
  buf[pos + 1] = val >>> 8 & 255
  buf[pos + 2] = val >>> 16 & 255
  buf[pos + 3] = val >>> 24
}

function writeBytes (val: Uint8Array, buf: Uint8Array, pos: number): void {
  buf.set(val, pos)
}

if (globalThis.Buffer != null) {
  Uint8ArrayWriter.prototype.bytes = function (value: Uint8Array) {
    const len = value.length >>> 0

    this.uint32(len)

    if (len > 0) {
      this._push(writeBytesBuffer, len, value)
    }

    return this
  }

  Uint8ArrayWriter.prototype.string = function (value: string) {
    const len = globalThis.Buffer.byteLength(value)

    this.uint32(len)

    if (len > 0) {
      this._push(writeStringBuffer, len, value)
    }

    return this
  }
}

function writeBytesBuffer (val: Uint8Array, buf: Uint8Array, pos: number): void {
  buf.set(val, pos) // faster than copy (requires node >= 4 where Buffers extend Uint8Array and set is properly inherited)
  // also works for plain array values
}

function writeStringBuffer (val: string, buf: Uint8Array, pos: number): void {
  if (val.length < 40) {
    // plain js is faster for short strings (probably due to redundant assertions)
    utf8.write(val, buf, pos)
    // @ts-expect-error buf isn't a Uint8Array?
  } else if (buf.utf8Write != null) {
    // @ts-expect-error buf isn't a Uint8Array?
    buf.utf8Write(val, pos)
  } else {
    buf.set(uint8ArrayFromString(val), pos)
  }
}

/**
 * Creates a new writer
 */
export function createWriter (): Writer {
  return new Uint8ArrayWriter()
}
