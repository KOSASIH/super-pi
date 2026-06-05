/**
 * @packageDocumentation
 *
 * Query DNS records using `node:dns`, DNS over HTTP and/or DNSJSON over HTTP.
 *
 * A list of publicly accessible servers can be found [here](https://github.com/curl/curl/wiki/DNS-over-HTTPS#publicly-available-servers).
 *
 * @example Using the default resolver
 *
 * ```TypeScript
 * import { dns } from '@multiformats/dns'
 *
 * const resolver = dns()
 *
 * // resolve A records with a 5s timeout
 * const result = await dns.query('google.com', {
 *   signal: AbortSignal.timeout(5000)
 * })
 * ```
 *
 * @example Using per-TLD resolvers
 *
 * ```TypeScript
 * import { dns } from '@multiformats/dns'
 * import { dnsJsonOverHttps } from '@multiformats/dns/resolvers'
 *
 * const resolver = dns({
 *   resolvers: {
 *     // will only be used to resolve `.com` addresses
 *     'com.': dnsJsonOverHttps('https://cloudflare-dns.com/dns-query'),
 *
 *     // this can also be an array, resolvers will be shuffled and tried in
 *     // series
 *     'net.': [
 *       dnsJsonOverHttps('https://dns.google/resolve'),
 *       dnsJsonOverHttps('https://dns.pub/dns-query')
 *     ],
 *
 *     // will only be used to resolve all other addresses
 *     '.': dnsJsonOverHttps('https://dnsforge.de/dns-query'),
 *   }
 * })
 * ```
 *
 * @example Query for specific record types
 *
 * ```TypeScript
 * import { dns, RecordType } from '@multiformats/dns'
 *
 * const resolver = dns()
 *
 * // resolve only TXT records
 * const result = await dns.query('google.com', {
 *   types: [
 *     RecordType.TXT
 *   ]
 * })
 * ```
 *
 * ## Caching
 *
 * Individual Aanswers are cached so. If you make a request, for which all
 * record types are cached, all values will be pulled from the cache.
 *
 * If any of the record types are not cached, a new request will be resolved as
 * if none of the records were cached, and the cache will be updated to include
 * the new results.
 *
 * @example Ignoring the cache
 *
 * ```TypeScript
 * import { dns, RecordType } from '@multiformats/dns'
 *
 * const resolver = dns()
 *
 * // do not used cached results, always resolve a new query
 * const result = await dns.query('google.com', {
 *   cached: false
 * })
 * ```
 */
import { DNS as DNSClass } from './dns.js';
/**
 * A subset of DNS Record Types
 *
 * @see https://www.iana.org/assignments/dns-parameters/dns-parameters.xhtml#dns-parameters-4.
 */
export var RecordType;
(function (RecordType) {
    RecordType[RecordType["A"] = 1] = "A";
    RecordType[RecordType["CNAME"] = 5] = "CNAME";
    RecordType[RecordType["TXT"] = 16] = "TXT";
    RecordType[RecordType["AAAA"] = 28] = "AAAA";
})(RecordType || (RecordType = {}));
/**
 * The default maximum amount of recursion allowed during a query
 */
export const MAX_RECURSIVE_DEPTH = 32;
export function dns(init = {}) {
    return new DNSClass(init);
}
//# sourceMappingURL=index.js.map