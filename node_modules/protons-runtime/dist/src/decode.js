import { createReader } from './utils/reader.js';
export function decodeMessage(buf, codec, opts) {
    const reader = createReader(buf);
    return codec.decode(reader, undefined, opts);
}
//# sourceMappingURL=decode.js.map