/**
 * Constructs new long bits.
 *
 * @classdesc Helper class for working with the low and high bits of a 64 bit value.
 * @memberof util
 * @function Object() { [native code] }
 * @param {number} lo - Low 32 bits, unsigned
 * @param {number} hi - High 32 bits, unsigned
 */
export declare class LongBits {
    lo: number;
    hi: number;
    constructor(lo: number, hi: number);
    /**
     * Converts this long bits to a possibly unsafe JavaScript number
     */
    toNumber(unsigned?: boolean): number;
    /**
     * Converts this long bits to a bigint
     */
    toBigInt(unsigned?: boolean): bigint;
    /**
     * Converts this long bits to a string
     */
    toString(unsigned?: boolean): string;
    /**
     * Zig-zag encodes this long bits
     */
    zzEncode(): this;
    /**
     * Zig-zag decodes this long bits
     */
    zzDecode(): this;
    /**
     * Calculates the length of this longbits when encoded as a varint.
     */
    length(): number;
    /**
     * Constructs new long bits from the specified number
     */
    static fromBigInt(value: bigint): LongBits;
    /**
     * Constructs new long bits from the specified number
     */
    static fromNumber(value: number): LongBits;
    /**
     * Constructs new long bits from a number, long or string
     */
    static from(value: bigint | number | string | {
        low: number;
        high: number;
    }): LongBits;
}
//# sourceMappingURL=longbits.d.ts.map