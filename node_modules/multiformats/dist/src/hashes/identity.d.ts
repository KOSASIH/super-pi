import * as Digest from './digest.js';
import type { DigestOptions } from './hasher.js';
declare const code: 0x0;
declare function digest(input: Uint8Array, options?: DigestOptions): Digest.Digest<typeof code, number>;
export declare const identity: {
    code: 0;
    name: string;
    encode: (input: Uint8Array) => Uint8Array;
    digest: typeof digest;
};
export {};
//# sourceMappingURL=identity.d.ts.map