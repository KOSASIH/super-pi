import { coerce } from '../bytes.js';
export const name = 'raw';
export const code = 0x55;
export function encode(node) {
    return coerce(node);
}
export function decode(data) {
    return coerce(data);
}
//# sourceMappingURL=raw.js.map