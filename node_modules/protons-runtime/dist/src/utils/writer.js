import { encodeUint8Array, encodingLength } from 'uint8-varint';
import { allocUnsafe } from 'uint8arrays/alloc';
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string';
import { writeFloatLE, writeDoubleLE } from './float.js';
import { LongBits } from './longbits.js';
import pool from './pool.js';
import * as utf8 from './utf8.js';
/**
 * Constructs a new writer operation instance.
 *
 * @classdesc Scheduled writer operation
 */
class Op {
    /**
     * Function to call
     */
    fn;
    /**
     * Value byte length
     */
    len;
    /**
     * Next operation
     */
    next;
    /**
     * Value to write
     */
    val;
    constructor(fn, len, val) {
        this.fn = fn;
        this.len = len;
        this.next = undefined;
        this.val = val; // type varies
    }
}
/* istanbul ignore next */
function noop() { }
/**
 * Constructs a new writer state instance
 */
class State {
    /**
     * Current head
     */
    head;
    /**
     * Current tail
     */
    tail;
    /**
     * Current buffer length
     */
    len;
    /**
     * Next state
     */
    next;
    constructor(writer) {
        this.head = writer.head;
        this.tail = writer.tail;
        this.len = writer.len;
        this.next = writer.states;
    }
}
const bufferPool = pool();
/**
 * Allocates a buffer of the specified size
 */
function alloc(size) {
    if (globalThis.Buffer != null) {
        return allocUnsafe(size);
    }
    return bufferPool(size);
}
/**
 * When a value is written, the writer calculates its byte length and puts it into a linked
 * list of operations to perform when finish() is called. This both allows us to allocate
 * buffers of the exact required size and reduces the amount of work we have to do compared
 * to first calculating over objects and then encoding over objects. In our case, the encoding
 * part is just a linked list walk calling operations with already prepared values.
 */
class Uint8ArrayWriter {
    /**
     * Current length
     */
    len;
    /**
     * Operations head
     */
    head;
    /**
     * Operations tail
     */
    tail;
    /**
     * Linked forked states
     */
    states;
    constructor() {
        this.len = 0;
        this.head = new Op(noop, 0, 0);
        this.tail = this.head;
        this.states = null;
    }
    /**
     * Pushes a new operation to the queue
     */
    _push(fn, len, val) {
        this.tail = this.tail.next = new Op(fn, len, val);
        this.len += len;
        return this;
    }
    /**
     * Writes an unsigned 32 bit value as a varint
     */
    uint32(value) {
        // here, the call to this.push has been inlined and a varint specific Op subclass is used.
        // uint32 is by far the most frequently used operation and benefits significantly from this.
        this.len += (this.tail = this.tail.next = new VarintOp((value = value >>> 0) <
            128
            ? 1
            : value < 16384
                ? 2
                : value < 2097152
                    ? 3
                    : value < 268435456
                        ? 4
                        : 5, value)).len;
        return this;
    }
    /**
     * Writes a signed 32 bit value as a varint`
     */
    int32(value) {
        return value < 0
            ? this._push(writeVarint64, 10, LongBits.fromNumber(value)) // 10 bytes per spec
            : this.uint32(value);
    }
    /**
     * Writes a 32 bit value as a varint, zig-zag encoded
     */
    sint32(value) {
        return this.uint32((value << 1 ^ value >> 31) >>> 0);
    }
    /**
     * Writes an unsigned 64 bit value as a varint
     */
    uint64(value) {
        const bits = LongBits.fromBigInt(value);
        return this._push(writeVarint64, bits.length(), bits);
    }
    /**
     * Writes an unsigned 64 bit value as a varint
     */
    uint64Number(value) {
        return this._push(encodeUint8Array, encodingLength(value), value);
    }
    /**
     * Writes an unsigned 64 bit value as a varint
     */
    uint64String(value) {
        return this.uint64(BigInt(value));
    }
    /**
     * Writes a signed 64 bit value as a varint
     */
    int64(value) {
        return this.uint64(value);
    }
    /**
     * Writes a signed 64 bit value as a varint
     */
    int64Number(value) {
        return this.uint64Number(value);
    }
    /**
     * Writes a signed 64 bit value as a varint
     */
    int64String(value) {
        return this.uint64String(value);
    }
    /**
     * Writes a signed 64 bit value as a varint, zig-zag encoded
     */
    sint64(value) {
        const bits = LongBits.fromBigInt(value).zzEncode();
        return this._push(writeVarint64, bits.length(), bits);
    }
    /**
     * Writes a signed 64 bit value as a varint, zig-zag encoded
     */
    sint64Number(value) {
        const bits = LongBits.fromNumber(value).zzEncode();
        return this._push(writeVarint64, bits.length(), bits);
    }
    /**
     * Writes a signed 64 bit value as a varint, zig-zag encoded
     */
    sint64String(value) {
        return this.sint64(BigInt(value));
    }
    /**
     * Writes a boolish value as a varint
     */
    bool(value) {
        return this._push(writeByte, 1, value ? 1 : 0);
    }
    /**
     * Writes an unsigned 32 bit value as fixed 32 bits
     */
    fixed32(value) {
        return this._push(writeFixed32, 4, value >>> 0);
    }
    /**
     * Writes a signed 32 bit value as fixed 32 bits
     */
    sfixed32(value) {
        return this.fixed32(value);
    }
    /**
     * Writes an unsigned 64 bit value as fixed 64 bits
     */
    fixed64(value) {
        const bits = LongBits.fromBigInt(value);
        return this._push(writeFixed32, 4, bits.lo)._push(writeFixed32, 4, bits.hi);
    }
    /**
     * Writes an unsigned 64 bit value as fixed 64 bits
     */
    fixed64Number(value) {
        const bits = LongBits.fromNumber(value);
        return this._push(writeFixed32, 4, bits.lo)._push(writeFixed32, 4, bits.hi);
    }
    /**
     * Writes an unsigned 64 bit value as fixed 64 bits
     */
    fixed64String(value) {
        return this.fixed64(BigInt(value));
    }
    /**
     * Writes a signed 64 bit value as fixed 64 bits
     */
    sfixed64(value) {
        return this.fixed64(value);
    }
    /**
     * Writes a signed 64 bit value as fixed 64 bits
     */
    sfixed64Number(value) {
        return this.fixed64Number(value);
    }
    /**
     * Writes a signed 64 bit value as fixed 64 bits
     */
    sfixed64String(value) {
        return this.fixed64String(value);
    }
    /**
     * Writes a float (32 bit)
     */
    float(value) {
        return this._push(writeFloatLE, 4, value);
    }
    /**
     * Writes a double (64 bit float).
     *
     * @function
     * @param {number} value - Value to write
     * @returns {Writer} `this`
     */
    double(value) {
        return this._push(writeDoubleLE, 8, value);
    }
    /**
     * Writes a sequence of bytes
     */
    bytes(value) {
        const len = value.length >>> 0;
        if (len === 0) {
            return this._push(writeByte, 1, 0);
        }
        return this.uint32(len)._push(writeBytes, len, value);
    }
    /**
     * Writes a string
     */
    string(value) {
        const len = utf8.length(value);
        return len !== 0
            ? this.uint32(len)._push(utf8.write, len, value)
            : this._push(writeByte, 1, 0);
    }
    /**
     * Forks this writer's state by pushing it to a stack.
     * Calling {@link Writer#reset|reset} or {@link Writer#ldelim|ldelim} resets the writer to the previous state.
     */
    fork() {
        this.states = new State(this);
        this.head = this.tail = new Op(noop, 0, 0);
        this.len = 0;
        return this;
    }
    /**
     * Resets this instance to the last state
     */
    reset() {
        if (this.states != null) {
            this.head = this.states.head;
            this.tail = this.states.tail;
            this.len = this.states.len;
            this.states = this.states.next;
        }
        else {
            this.head = this.tail = new Op(noop, 0, 0);
            this.len = 0;
        }
        return this;
    }
    /**
     * Resets to the last state and appends the fork state's current write length as a varint followed by its operations.
     */
    ldelim() {
        const head = this.head;
        const tail = this.tail;
        const len = this.len;
        this.reset().uint32(len);
        if (len !== 0) {
            this.tail.next = head.next; // skip noop
            this.tail = tail;
            this.len += len;
        }
        return this;
    }
    /**
     * Finishes the write operation
     */
    finish() {
        let head = this.head.next; // skip noop
        const buf = alloc(this.len);
        let pos = 0;
        while (head != null) {
            head.fn(head.val, buf, pos);
            pos += head.len;
            head = head.next;
        }
        // this.head = this.tail = null;
        return buf;
    }
}
function writeByte(val, buf, pos) {
    buf[pos] = val & 255;
}
function writeVarint32(val, buf, pos) {
    while (val > 127) {
        buf[pos++] = val & 127 | 128;
        val >>>= 7;
    }
    buf[pos] = val;
}
/**
 * Constructs a new varint writer operation instance.
 *
 * @classdesc Scheduled varint writer operation
 */
class VarintOp extends Op {
    next;
    constructor(len, val) {
        super(writeVarint32, len, val);
        this.next = undefined;
    }
}
function writeVarint64(val, buf, pos) {
    while (val.hi !== 0) {
        buf[pos++] = val.lo & 127 | 128;
        val.lo = (val.lo >>> 7 | val.hi << 25) >>> 0;
        val.hi >>>= 7;
    }
    while (val.lo > 127) {
        buf[pos++] = val.lo & 127 | 128;
        val.lo = val.lo >>> 7;
    }
    buf[pos++] = val.lo;
}
function writeFixed32(val, buf, pos) {
    buf[pos] = val & 255;
    buf[pos + 1] = val >>> 8 & 255;
    buf[pos + 2] = val >>> 16 & 255;
    buf[pos + 3] = val >>> 24;
}
function writeBytes(val, buf, pos) {
    buf.set(val, pos);
}
if (globalThis.Buffer != null) {
    Uint8ArrayWriter.prototype.bytes = function (value) {
        const len = value.length >>> 0;
        this.uint32(len);
        if (len > 0) {
            this._push(writeBytesBuffer, len, value);
        }
        return this;
    };
    Uint8ArrayWriter.prototype.string = function (value) {
        const len = globalThis.Buffer.byteLength(value);
        this.uint32(len);
        if (len > 0) {
            this._push(writeStringBuffer, len, value);
        }
        return this;
    };
}
function writeBytesBuffer(val, buf, pos) {
    buf.set(val, pos); // faster than copy (requires node >= 4 where Buffers extend Uint8Array and set is properly inherited)
    // also works for plain array values
}
function writeStringBuffer(val, buf, pos) {
    if (val.length < 40) {
        // plain js is faster for short strings (probably due to redundant assertions)
        utf8.write(val, buf, pos);
        // @ts-expect-error buf isn't a Uint8Array?
    }
    else if (buf.utf8Write != null) {
        // @ts-expect-error buf isn't a Uint8Array?
        buf.utf8Write(val, pos);
    }
    else {
        buf.set(uint8ArrayFromString(val), pos);
    }
}
/**
 * Creates a new writer
 */
export function createWriter() {
    return new Uint8ArrayWriter();
}
//# sourceMappingURL=writer.js.map