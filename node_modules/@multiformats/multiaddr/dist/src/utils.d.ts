import type { MultibaseCodec } from 'multiformats';
import type { SupportedEncodings } from 'uint8arrays/to-string';
export declare function bytesToString(base: SupportedEncodings): (buf: Uint8Array) => string;
export declare function stringToBytes(base: SupportedEncodings): (value: string) => Uint8Array;
export declare function bytes2port(buf: Uint8Array): string;
export declare function port2bytes(port: string | number): Uint8Array;
export declare function onion2bytes(str: string): Uint8Array;
export declare function onion32bytes(str: string): Uint8Array;
export declare function bytes2onion(buf: Uint8Array): string;
export declare const ip4ToBytes: (ip: string) => Uint8Array;
export declare const ip6ToBytes: (ip: string) => Uint8Array;
export declare const ip4ToString: (buf: Uint8Array) => string;
export declare const ip6ToString: (buf: Uint8Array) => string;
export declare function ip6StringToValue(str: string): string;
export declare function mb2bytes(mbstr: string): Uint8Array;
export declare function bytes2mb(base: MultibaseCodec<any>): (buf: Uint8Array) => string;
//# sourceMappingURL=utils.d.ts.map