import type { EnhancedKeyPair } from './interface.js';
/**
 * Generates a set of keys for each party by stretching the shared key.
 * (myIV, theirIV, myCipherKey, theirCipherKey, myMACKey, theirMACKey)
 */
export declare function keyStretcher(cipherType: 'AES-128' | 'AES-256' | 'Blowfish', hash: 'SHA1' | 'SHA256' | 'SHA512', secret: Uint8Array): Promise<EnhancedKeyPair>;
//# sourceMappingURL=key-stretcher.d.ts.map