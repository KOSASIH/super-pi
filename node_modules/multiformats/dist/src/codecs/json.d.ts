import type { ArrayBufferView, ByteView } from './interface.js';
export declare const name = "json";
export declare const code = 512;
export declare function encode<T>(node: T): ByteView<T>;
export declare function decode<T>(data: ByteView<T> | ArrayBufferView<T>): T;
//# sourceMappingURL=json.d.ts.map