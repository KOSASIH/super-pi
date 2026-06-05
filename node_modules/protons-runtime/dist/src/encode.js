import { createWriter } from './utils/writer.js';
export function encodeMessage(message, codec) {
    const w = createWriter();
    codec.encode(message, w, {
        lengthDelimited: false
    });
    return w.finish();
}
//# sourceMappingURL=encode.js.map