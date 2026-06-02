import type { Codec } from './codec.js';
export declare function encodeMessage<T>(message: Partial<T>, codec: Pick<Codec<T>, 'encode'>): Uint8Array;
//# sourceMappingURL=encode.d.ts.map