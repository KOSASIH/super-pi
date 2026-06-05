import type { CreateOptions, AESCipher } from './interface.js';
export declare const derivedEmptyPasswordKey: {
    alg: string;
    ext: boolean;
    k: string;
    key_ops: string[];
    kty: string;
};
export declare function create(opts?: CreateOptions): AESCipher;
//# sourceMappingURL=aes-gcm.browser.d.ts.map