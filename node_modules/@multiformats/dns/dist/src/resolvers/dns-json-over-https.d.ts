import type { DNSResolver } from './index.js';
/**
 * Browsers limit concurrent connections per host (~6), we don't want to exhaust
 * the limit so this value controls how many DNS queries can be in flight at
 * once.
 */
export declare const DEFAULT_QUERY_CONCURRENCY = 4;
export interface DNSJSONOverHTTPSOptions {
    queryConcurrency?: number;
}
/**
 * Uses the RFC 8427 'application/dns-json' content-type to resolve DNS queries.
 *
 * Supports and server that uses the same schema as Google's DNS over HTTPS
 * resolver.
 *
 * This resolver needs fewer dependencies than the regular DNS-over-HTTPS
 * resolver so can result in a smaller bundle size and consequently is preferred
 * for browser use.
 *
 * @see https://developers.cloudflare.com/1.1.1.1/encryption/dns-over-https/make-api-requests/dns-json/
 * @see https://github.com/curl/curl/wiki/DNS-over-HTTPS#publicly-available-servers
 * @see https://dnsprivacy.org/public_resolvers/
 * @see https://datatracker.ietf.org/doc/html/rfc8427
 */
export declare function dnsJsonOverHttps(url: string, init?: DNSJSONOverHTTPSOptions): DNSResolver;
//# sourceMappingURL=dns-json-over-https.d.ts.map