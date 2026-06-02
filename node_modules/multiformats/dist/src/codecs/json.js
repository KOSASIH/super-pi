const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();
export const name = 'json';
export const code = 0x0200;
export function encode(node) {
    return textEncoder.encode(JSON.stringify(node));
}
export function decode(data) {
    return JSON.parse(textDecoder.decode(data));
}
//# sourceMappingURL=json.js.map