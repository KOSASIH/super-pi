import type { Multibase } from 'multiformats';
/**
 * Exports the given PrivateKey as a base64 encoded string.
 * The PrivateKey is encrypted via a password derived PBKDF2 key
 * leveraging the aes-gcm cipher algorithm.
 */
export declare function exporter(privateKey: Uint8Array, password: string): Promise<Multibase<'m'>>;
//# sourceMappingURL=exporter.d.ts.map