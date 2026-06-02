import type { ArrayBufferView, ByteView } from './interface.js';
export declare const name = "raw";
export declare const code = 85;
export declare function encode(node: Uint8Array): ByteView<Uint8Array>;
export declare function decode(data: ByteView<Uint8Array> | ArrayBufferView<Uint8Array>): Uint8Array;
//# sourceMappingURL=raw.d.ts.map