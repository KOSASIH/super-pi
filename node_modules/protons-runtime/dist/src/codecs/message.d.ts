import type { EncodeFunction, DecodeFunction, Codec } from '../codec.js';
export interface Factory<A, T> {
    new (obj: A): T;
}
export declare function message<T>(encode: EncodeFunction<T>, decode: DecodeFunction<T>): Codec<T>;
//# sourceMappingURL=message.d.ts.map