import { Buffer } from 'node:buffer';
/**
 * Can be used with Array.sort to sort and array with Uint8Array entries
 */
export function compare(a, b) {
    return Buffer.compare(a, b);
}
//# sourceMappingURL=compare.node.js.map