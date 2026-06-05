export default _brrp__multiformats_scope_baseX;
/**
 * @param {string} ALPHABET
 * @param {any} name
 */
declare function _brrp__multiformats_scope_baseX(ALPHABET: string, name: any): {
    encode: (source: any[] | Iterable<number>) => string;
    decodeUnsafe: (source: string | string[]) => Uint8Array<ArrayBuffer> | undefined;
    decode: (string: string | string[]) => Uint8Array<ArrayBuffer>;
};
//# sourceMappingURL=base-x.d.ts.map