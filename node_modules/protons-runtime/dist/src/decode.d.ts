import type { Codec, DecodeOptions } from './codec.js';
import type { Uint8ArrayList } from 'uint8arraylist';
export declare function decodeMessage<T>(buf: Uint8Array | Uint8ArrayList, codec: Pick<Codec<T>, 'decode'>, opts?: DecodeOptions<T>): T;
//# sourceMappingURL=decode.d.ts.map