import { IpNet } from '@chainsafe/netmask';
import type { Multiaddr } from './index.ts';
export declare function convertToIpNet(multiaddr: Multiaddr): IpNet;
/**
 * converts (serializes) addresses
 *
 * @deprecated Will be removed in a future release
 */
export declare function convert(proto: string, a: string): Uint8Array;
export declare function convert(proto: string, a: Uint8Array): string;
/**
 * Convert [code, Uint8Array] to string
 *
 * @deprecated Will be removed in a future release
 */
export declare function convertToString(proto: number | string, buf: Uint8Array): string;
/**
 * Convert [code, string] to Uint8Array
 *
 * @deprecated Will be removed in a future release
 */
export declare function convertToBytes(proto: string | number, str: string): Uint8Array;
//# sourceMappingURL=convert.d.ts.map