import * as Digest from './digest.js';
import type { MultihashHasher } from './interface.js';
type Await<T> = Promise<T> | T;
export interface HasherInit<Name extends string, Code extends number> {
    name: Name;
    code: Code;
    encode(input: Uint8Array): Await<Uint8Array>;
    /**
     * The minimum length a hash is allowed to be truncated to in bytes
     *
     * @default 20
     */
    minDigestLength?: number;
    /**
     * The maximum length a hash is allowed to be truncated to in bytes. If not
     * specified it will be inferred from the length of the digest.
     */
    maxDigestLength?: number;
}
export declare function from<Name extends string, Code extends number>({ name, code, encode, minDigestLength, maxDigestLength }: HasherInit<Name, Code>): Hasher<Name, Code>;
export interface DigestOptions {
    /**
     * Truncate the returned digest to this number of bytes.
     *
     * This may cause the digest method to throw/reject if the passed value is
     * greater than the digest length or below a threshold under which the risk of
     * hash collisions is significant.
     *
     * The actual value of this threshold can depend on the hashing algorithm in
     * use.
     */
    truncate?: number;
}
/**
 * Hasher represents a hashing algorithm implementation that produces as
 * `MultihashDigest`.
 */
export declare class Hasher<Name extends string, Code extends number> implements MultihashHasher<Code> {
    readonly name: Name;
    readonly code: Code;
    readonly encode: (input: Uint8Array) => Await<Uint8Array>;
    readonly minDigestLength: number;
    readonly maxDigestLength?: number;
    constructor(name: Name, code: Code, encode: (input: Uint8Array) => Await<Uint8Array>, minDigestLength?: number, maxDigestLength?: number);
    digest(input: Uint8Array, options?: DigestOptions): Await<Digest.Digest<Code, number>>;
}
export {};
//# sourceMappingURL=hasher.d.ts.map