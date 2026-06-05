/**
 * @packageDocumentation
 *
 * Exposes an interface to the Keyed-Hash Message Authentication Code (HMAC) as defined in U.S. Federal Information Processing Standards Publication 198. An HMAC is a cryptographic hash that uses a key to sign a message. The receiver verifies the hash by recomputing it using the same key.
 *
 * @example
 *
 * ```TypeScript
 * import { create } from '@libp2p/hmac'
 *
 * const hash = 'SHA1' // 'SHA256' || 'SHA512'
 * const hmac = await crypto.hmac.create(hash, uint8ArrayFromString('secret'))
 * const sig = await hmac.digest(uint8ArrayFromString('hello world'))
 * console.log(sig)
 * ```
 */
export interface HMAC {
    digest(data: Uint8Array): Promise<Uint8Array>;
    length: number;
}
export declare function create(hash: 'SHA1' | 'SHA256' | 'SHA512', secret: Uint8Array): Promise<HMAC>;
//# sourceMappingURL=index.d.ts.map