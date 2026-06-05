import * as json from './codecs/json.js';
import * as raw from './codecs/raw.js';
import { CID, hasher, digest, varint, bytes } from './index.js';
export declare const bases: {
    base256emoji: import("./bases/base.ts").Codec<"base256emoji", "🚀">;
    base64: import("./bases/base.ts").Codec<"base64", "m">;
    base64pad: import("./bases/base.ts").Codec<"base64pad", "M">;
    base64url: import("./bases/base.ts").Codec<"base64url", "u">;
    base64urlpad: import("./bases/base.ts").Codec<"base64urlpad", "U">;
    base58btc: import("./bases/base.ts").Codec<"base58btc", "z">;
    base58flickr: import("./bases/base.ts").Codec<"base58flickr", "Z">;
    base36: import("./bases/base.ts").Codec<"base36", "k">;
    base36upper: import("./bases/base.ts").Codec<"base36upper", "K">;
    base32: import("./bases/base.ts").Codec<"base32", "b">;
    base32upper: import("./bases/base.ts").Codec<"base32upper", "B">;
    base32pad: import("./bases/base.ts").Codec<"base32pad", "c">;
    base32padupper: import("./bases/base.ts").Codec<"base32padupper", "C">;
    base32hex: import("./bases/base.ts").Codec<"base32hex", "v">;
    base32hexupper: import("./bases/base.ts").Codec<"base32hexupper", "V">;
    base32hexpad: import("./bases/base.ts").Codec<"base32hexpad", "t">;
    base32hexpadupper: import("./bases/base.ts").Codec<"base32hexpadupper", "T">;
    base32z: import("./bases/base.ts").Codec<"base32z", "h">;
    base16: import("./bases/base.ts").Codec<"base16", "f">;
    base16upper: import("./bases/base.ts").Codec<"base16upper", "F">;
    base10: import("./bases/base.ts").Codec<"base10", "9">;
    base8: import("./bases/base.ts").Codec<"base8", "7">;
    base2: import("./bases/base.ts").Codec<"base2", "0">;
    identity: import("./bases/base.ts").Codec<"identity", "\0">;
};
export declare const hashes: {
    identity: {
        code: 0;
        name: string;
        encode: (input: Uint8Array) => Uint8Array;
        digest: (input: Uint8Array, options?: hasher.DigestOptions) => digest.Digest<0, number>;
    };
    sha256: hasher.Hasher<"sha2-256", 18>;
    sha512: hasher.Hasher<"sha2-512", 19>;
};
export declare const codecs: {
    raw: typeof raw;
    json: typeof json;
};
export { CID, hasher, digest, varint, bytes };
//# sourceMappingURL=basics.d.ts.map