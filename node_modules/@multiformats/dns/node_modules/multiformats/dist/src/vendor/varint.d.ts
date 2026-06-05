export default _brrp_varint;
declare namespace _brrp_varint {
    export { encode_1 as encode };
    export { decode };
    export { length as encodingLength };
}
/**
 * @param {number} num
 * @param {number[]} out
 * @param {number} offset
 */
declare function encode_1(num: number, out: number[], offset: number): number[];
/**
 * @param {string | any[]} buf
 * @param {number} offset
 */
declare function decode(buf: string | any[], offset: number): number;
declare function length(value: number): 2 | 1 | 8 | 7 | 4 | 5 | 6 | 3 | 9 | 10;
//# sourceMappingURL=varint.d.ts.map