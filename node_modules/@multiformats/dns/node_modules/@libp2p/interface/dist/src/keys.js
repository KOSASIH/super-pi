/**
 * Returns true if the passed argument has type overlap with the `PublicKey`
 * interface. Can be used to disambiguate object types.
 */
export function isPublicKey(key) {
    if (key == null) {
        return false;
    }
    return (key.type === 'RSA' || key.type === 'Ed25519' || key.type === 'secp256k1' || key.type === 'ECDSA') &&
        key.raw instanceof Uint8Array &&
        typeof key.equals === 'function' &&
        typeof key.toMultihash === 'function' &&
        typeof key.toCID === 'function' &&
        typeof key.verify === 'function';
}
/**
 * Returns true if the passed argument has type overlap with the `PrivateKey`
 * interface. Can be used to disambiguate object types.
 */
export function isPrivateKey(key) {
    if (key == null) {
        return false;
    }
    return (key.type === 'RSA' || key.type === 'Ed25519' || key.type === 'secp256k1' || key.type === 'ECDSA') &&
        isPublicKey(key.publicKey) &&
        key.raw instanceof Uint8Array &&
        typeof key.equals === 'function' &&
        typeof key.sign === 'function';
}
//# sourceMappingURL=keys.js.map