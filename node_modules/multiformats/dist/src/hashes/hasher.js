import * as Digest from './digest.js';
const DEFAULT_MIN_DIGEST_LENGTH = 20;
export function from({ name, code, encode, minDigestLength, maxDigestLength }) {
    return new Hasher(name, code, encode, minDigestLength, maxDigestLength);
}
/**
 * Hasher represents a hashing algorithm implementation that produces as
 * `MultihashDigest`.
 */
export class Hasher {
    name;
    code;
    encode;
    minDigestLength;
    maxDigestLength;
    constructor(name, code, encode, minDigestLength, maxDigestLength) {
        this.name = name;
        this.code = code;
        this.encode = encode;
        this.minDigestLength = minDigestLength ?? DEFAULT_MIN_DIGEST_LENGTH;
        this.maxDigestLength = maxDigestLength;
    }
    digest(input, options) {
        if (options?.truncate != null) {
            if (options.truncate < this.minDigestLength) {
                throw new Error(`Invalid truncate option, must be greater than or equal to ${this.minDigestLength}`);
            }
            if (this.maxDigestLength != null && options.truncate > this.maxDigestLength) {
                throw new Error(`Invalid truncate option, must be less than or equal to ${this.maxDigestLength}`);
            }
        }
        if (input instanceof Uint8Array) {
            const result = this.encode(input);
            if (result instanceof Uint8Array) {
                return createDigest(result, this.code, options?.truncate);
            }
            return result.then(digest => createDigest(digest, this.code, options?.truncate));
        }
        else {
            throw Error('Unknown type, must be binary type');
            /* c8 ignore next 1 */
        }
    }
}
/**
 * Create a Digest from the passed uint8array and code, optionally truncating it
 * first.
 */
function createDigest(digest, code, truncate) {
    if (truncate != null && truncate !== digest.byteLength) {
        if (truncate > digest.byteLength) {
            throw new Error(`Invalid truncate option, must be less than or equal to ${digest.byteLength}`);
        }
        digest = digest.subarray(0, truncate);
    }
    return Digest.create(code, digest);
}
//# sourceMappingURL=hasher.js.map