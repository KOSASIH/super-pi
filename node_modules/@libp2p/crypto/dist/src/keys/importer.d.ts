/**
 * Attempts to decrypt a base64 encoded PrivateKey string
 * with the given password. The privateKey must have been exported
 * using the same password and underlying cipher (aes-gcm)
 */
export declare function importer(privateKey: string, password: string): Promise<Uint8Array>;
//# sourceMappingURL=importer.d.ts.map