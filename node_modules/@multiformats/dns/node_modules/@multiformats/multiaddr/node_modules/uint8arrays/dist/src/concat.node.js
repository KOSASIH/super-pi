import { Buffer } from 'node:buffer';
import { asUint8Array } from '#util/as-uint8array';
/**
 * Returns a new Uint8Array created by concatenating the passed Uint8Arrays
 */
export function concat(arrays, length) {
    return asUint8Array(Buffer.concat(arrays, length));
}
//# sourceMappingURL=concat.node.js.map