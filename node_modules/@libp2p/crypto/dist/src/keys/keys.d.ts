import type { Codec } from 'protons-runtime';
import type { Uint8ArrayList } from 'uint8arraylist';
export declare enum KeyType {
    RSA = "RSA",
    Ed25519 = "Ed25519",
    Secp256k1 = "Secp256k1"
}
export declare namespace KeyType {
    const codec: () => Codec<KeyType>;
}
export interface PublicKey {
    Type?: KeyType;
    Data?: Uint8Array;
}
export declare namespace PublicKey {
    const codec: () => Codec<PublicKey>;
    const encode: (obj: Partial<PublicKey>) => Uint8Array;
    const decode: (buf: Uint8Array | Uint8ArrayList) => PublicKey;
}
export interface PrivateKey {
    Type?: KeyType;
    Data?: Uint8Array;
}
export declare namespace PrivateKey {
    const codec: () => Codec<PrivateKey>;
    const encode: (obj: Partial<PrivateKey>) => Uint8Array;
    const decode: (buf: Uint8Array | Uint8ArrayList) => PrivateKey;
}
//# sourceMappingURL=keys.d.ts.map