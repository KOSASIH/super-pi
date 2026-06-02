import type { Resolver } from './index.js';
import type { AbortOptions } from '../index.js';
import type { DNS } from '@multiformats/dns';
/**
 * @deprecated DNS resolving will be removed in a future release
 */
export interface DNSADDROptions extends AbortOptions {
    /**
     * An optional DNS resolver
     */
    dns?: DNS;
    /**
     * When resolving DNSADDR Multiaddrs that resolve to other DNSADDR Multiaddrs,
     * limit how many times we will recursively resolve them.
     *
     * @default 32
     */
    maxRecursiveDepth?: number;
}
/**
 * @deprecated DNS resolving will be removed in a future release
 */
export declare const dnsaddrResolver: Resolver<DNSADDROptions>;
//# sourceMappingURL=dnsaddr.d.ts.map