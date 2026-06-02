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

import { DNS as DNSClass } from './dns.js'
import type { DNSResolver } from './resolvers/index.js'
import type { ComponentLogger } from '@libp2p/interface'
import type { ProgressEvent, ProgressOptions } from 'progress-events'

/**
 * A subset of DNS Record Types
 *
 * @see https://www.iana.org/assignments/dns-parameters/dns-parameters.xhtml#dns-parameters-4.
 */
export enum RecordType {
  A = 1,
  CNAME = 5,
  TXT = 16,
  AAAA = 28
}

export interface Question {
  /**
   * The record name requested.
   */
  name: string

  /**
   * The type of DNS record requested.
   *
   * @see https://www.iana.org/assignments/dns-parameters/dns-parameters.xhtml#dns-parameters-4.
   */
  type: RecordType
}

export interface Answer {
  /**
   * The record owner.
   */
  name: string

  /**
   * The type of DNS record.
   *
   * @see https://www.iana.org/assignments/dns-parameters/dns-parameters.xhtml#dns-parameters-4
   */
  type: RecordType

  /**
   * The number of seconds the answer can be stored in cache before it is
   * considered stale.
   */
  TTL: number

  /**
   * The value of the DNS record for the given name and type. The data will be
   * in text for standardized record types and in hex for unknown types.
   */
  data: string
}

export interface DNSResponse {
  /**
   * The Response Code of the DNS Query.
   *
   * @see https://www.iana.org/assignments/dns-parameters/dns-parameters.xhtml#dns-parameters-6
   */
  Status: number

  /**
   * If true, it means the truncated bit was set. This happens when the DNS
   * answer is larger than a single UDP or TCP packet.
   */
  TC: boolean

  /**
   * If true, it means the Recursive Desired bit was set.
   */
  RD: boolean

  /**
   * If true, it means the Recursion Available bit was set.
   */
  RA: boolean

  /**
   * If true, it means that every record in the answer was verified with DNSSEC.
   */
  AD: boolean

  /**
   * If true, the client asked to disable DNSSEC validation.
   */
  CD: boolean

  /**
   * The records that were requested.
   */
  Question: Question[]

  /**
   * Values for the records that were requested.
   */
  Answer: Answer[]
}

/**
 * The default maximum amount of recursion allowed during a query
 */
export const MAX_RECURSIVE_DEPTH = 32

export interface QueryOptions extends ProgressOptions<ResolveDnsProgressEvents> {
  signal?: AbortSignal

  /**
   * Do not use cached DNS entries
   *
   * @default false
   */
  cached?: boolean

  /**
   * The type or types of DNS records to resolve
   *
   * @default [RecordType.A, RecordType.AAAA]
   */
  types?: RecordType | RecordType[]

  /**
   * An optional logger
   */
  logger?: ComponentLogger
}

export interface DNS {
  query(fqdn: string, options?: QueryOptions): Promise<DNSResponse>
}

export type ResolveDnsProgressEvents =
  ProgressEvent<'dns:cache', string> |
  ProgressEvent<'dns:query', string> |
  ProgressEvent<'dns:response', DNSResponse> |
  ProgressEvent<'dns:error', Error>

export type DNSResolvers = Record<string, DNSResolver | DNSResolver[]>

export interface DNSInit {
  /**
   * A set of resolvers used to answer DNS queries
   *
   * String keys control which resolvers are used for which TLDs.
   *
   * @example
   *
   * ```TypeScript
   * import { dns } from '@multiformats/dns'
   * import { dnsOverHttps } from '@multiformats/dns'
   *
   * const resolver = dns({
   *   resolvers: {
   *     // only used for .com domains
   *     'com.': dnsOverHttps('https://example-1.com'),
   *
   *     // only used for .net domains, can be an array
   *     'net.': [
   *       dnsOverHttps('https://example-2.com'),
   *       dnsOverHttps('https://example-3.com'),
   *     ],
   *
   *     // used for everything else (can be an array)
   *     '.': dnsOverHttps('https://example-4.com')
   *   }
   * })
   * ```
   */
  resolvers?: DNSResolvers

  /**
   * To avoid repeating DNS lookups, successful answers are cached according to
   * their TTL. To avoid exhausting memory, this option controls how many
   * answers to cache.
   *
   * @default 1000
   */
  cacheSize?: number

  /**
   * An optional logger
   */
  logger?: ComponentLogger
}

export function dns (init: DNSInit = {}): DNS {
  return new DNSClass(init)
}
