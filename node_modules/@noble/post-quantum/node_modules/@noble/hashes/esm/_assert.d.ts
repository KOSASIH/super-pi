declare function anumber(n: number): void;
declare function abytes(b: Uint8Array | undefined, ...lengths: number[]): void;
type Hash = {
    (data: Uint8Array): Uint8Array;
    blockLen: number;
    outputLen: number;
    create: any;
};
declare function ahash(h: Hash): void;
declare function aexists(instance: any, checkFinished?: boolean): void;
declare function aoutput(out: any, instance: any): void;
export { anumber, anumber as number, abytes, abytes as bytes, ahash, aexists, aoutput };
declare const assert: {
    number: typeof anumber;
    bytes: typeof abytes;
    hash: typeof ahash;
    exists: typeof aexists;
    output: typeof aoutput;
};
export default assert;
//# sourceMappingURL=_assert.d.ts.map