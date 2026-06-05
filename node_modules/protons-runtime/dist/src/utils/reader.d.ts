import type { Reader } from '../index.js';
import type { Uint8ArrayList } from 'uint8arraylist';
/**
 * Constructs a new reader instance using the specified buffer.
 */
export declare class Uint8ArrayReader implements Reader {
    buf: Uint8Array;
    pos: number;
    len: number;
    _slice: (begin?: number, end?: number) => Uint8Array<ArrayBufferLike>;
    constructor(buffer: Uint8Array);
    /**
     * Reads a varint as an unsigned 32 bit value
     */
    uint32(): number;
    /**
     * Reads a varint as a signed 32 bit value
     */
    int32(): number;
    /**
     * Reads a zig-zag encoded varint as a signed 32 bit value
     */
    sint32(): number;
    /**
     * Reads a varint as a boolean
     */
    bool(): boolean;
    /**
     * Reads fixed 32 bits as an unsigned 32 bit integer
     */
    fixed32(): number;
    /**
     * Reads fixed 32 bits as a signed 32 bit integer
     */
    sfixed32(): number;
    /**
     * Reads a float (32 bit) as a number
     */
    float(): number;
    /**
     * Reads a double (64 bit float) as a number
     */
    double(): number;
    /**
     * Reads a sequence of bytes preceded by its length as a varint
     */
    bytes(): Uint8Array;
    /**
     * Reads a string preceded by its byte length as a varint
     */
    string(): string;
    /**
     * Skips the specified number of bytes if specified, otherwise skips a varint
     */
    skip(length?: number): this;
    /**
     * Skips the next element of the specified wire type
     */
    skipType(wireType: number): this;
    private readLongVarint;
    private readFixed64;
    /**
     * Reads a varint as a signed 64 bit value
     */
    int64(): bigint;
    /**
     * Reads a varint as a signed 64 bit value returned as a possibly unsafe
     * JavaScript number
     */
    int64Number(): number;
    /**
     * Reads a varint as a signed 64 bit value returned as a string
     */
    int64String(): string;
    /**
     * Reads a varint as an unsigned 64 bit value
     */
    uint64(): bigint;
    /**
     * Reads a varint as an unsigned 64 bit value returned as a possibly unsafe
     * JavaScript number
     */
    uint64Number(): number;
    /**
     * Reads a varint as an unsigned 64 bit value returned as a string
     */
    uint64String(): string;
    /**
     * Reads a zig-zag encoded varint as a signed 64 bit value
     */
    sint64(): bigint;
    /**
     * Reads a zig-zag encoded varint as a signed 64 bit value returned as a
     * possibly unsafe JavaScript number
     */
    sint64Number(): number;
    /**
     * Reads a zig-zag encoded varint as a signed 64 bit value returned as a
     * string
     */
    sint64String(): string;
    /**
     * Reads fixed 64 bits
     */
    fixed64(): bigint;
    /**
     * Reads fixed 64 bits returned as a possibly unsafe JavaScript number
     */
    fixed64Number(): number;
    /**
     * Reads fixed 64 bits returned as a string
     */
    fixed64String(): string;
    /**
     * Reads zig-zag encoded fixed 64 bits
     */
    sfixed64(): bigint;
    /**
     * Reads zig-zag encoded fixed 64 bits returned as a possibly unsafe
     * JavaScript number
     */
    sfixed64Number(): number;
    /**
     * Reads zig-zag encoded fixed 64 bits returned as a string
     */
    sfixed64String(): string;
}
export declare function createReader(buf: Uint8Array | Uint8ArrayList): Reader;
//# sourceMappingURL=reader.d.ts.map