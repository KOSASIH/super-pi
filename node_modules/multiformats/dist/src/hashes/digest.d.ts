import type { MultihashDigest } from './interface.js';
/**
 * Creates a multihash digest.
 */
export declare function create<Code extends number>(code: Code, digest: Uint8Array): Digest<Code, number>;
/**
 * Turns bytes representation of multihash digest into an instance.
 */
export declare function decode(multihash: Uint8Array): MultihashDigest;
export declare function equals(a: MultihashDigest, b: unknown): b is MultihashDigest;
/**
 * Represents a multihash digest which carries information about the
 * hashing algorithm and an actual hash digest.
 */
export declare class Digest<Code extends number, Size extends number> implements MultihashDigest {
    readonly code: Code;
    readonly size: Size;
    readonly digest: Uint8Array;
    readonly bytes: Uint8Array;
    /**
     * Creates a multihash digest.
     */
    constructor(code: Code, size: Size, digest: Uint8Array, bytes: Uint8Array);
}
/**
 * Used to check that the passed multihash has the passed code
 */
export declare function hasCode<T extends number>(digest: MultihashDigest, code: T): digest is MultihashDigest<T>;
//# sourceMappingURL=digest.d.ts.map