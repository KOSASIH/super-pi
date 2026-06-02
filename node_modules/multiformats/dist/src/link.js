import { CID, format, toJSON, fromJSON } from './cid.js';
// This way TS will also expose all the types from module
export * from './link/interface.js';
const DAG_PB_CODE = 0x70;
// eslint-disable-next-line
const SHA_256_CODE = 0x12;
/**
 * Simplified version of `create` for CIDv0.
 */
export function createLegacy(digest) {
    return CID.create(0, DAG_PB_CODE, digest);
}
/**
 * Simplified version of `create` for CIDv1.
 *
 * @param code - Content encoding format code.
 * @param digest - Miltihash of the content.
 */
export function create(code, digest) {
    return CID.create(1, code, digest);
}
/**
 * Type predicate returns true if value is the link.
 */
export function isLink(value) {
    if (value == null) {
        return false;
    }
    const withSlash = value;
    if (withSlash['/'] != null && withSlash['/'] === withSlash.bytes) {
        return true;
    }
    const withAsCID = value;
    if (withAsCID.asCID === value) {
        return true;
    }
    return false;
}
/**
 * Takes cid in a string representation and creates an instance. If `base`
 * decoder is not provided will use a default from the configuration. It will
 * throw an error if encoding of the CID is not compatible with supplied (or
 * a default decoder).
 */
export function parse(source, base) {
    return CID.parse(source, base);
}
export { format, toJSON, fromJSON };
/**
 * Decoded a CID from its binary representation. The byte array must contain
 * only the CID with no additional bytes.
 *
 * An error will be thrown if the bytes provided do not contain a valid
 * binary representation of a CID.
 */
export function decode(bytes) {
    return CID.decode(bytes);
}
//# sourceMappingURL=link.js.map