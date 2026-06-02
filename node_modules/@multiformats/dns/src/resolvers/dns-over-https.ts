import { decode, encode, RECURSION_DESIRED } from '@dnsquery/dns-packet'
import PQueue from 'p-queue'
import { CustomProgressEvent } from 'progress-events'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { RecordType } from '../index.js'
import { getTypes } from '../utils/get-types.js'
import { toDNSResponse } from '../utils/to-dns-response.js'
import type { DNSResolver } from './index.js'
import type { DNSResponse } from '../index.js'
import type { ComponentLogger } from '@libp2p/interface'

/**
 * Browsers limit concurrent connections per host (~6), we don't want to exhaust
 * the limit so this value controls how many DNS queries can be in flight at
 * once.
 */
export const DEFAULT_QUERY_CONCURRENCY = 4

export interface DNSOverHTTPSOptions {
  queryConcurrency?: number
  logger?: ComponentLogger
}

function toType (type: RecordType): 'A' | 'AAAA' | 'TXT' | 'CNAME' {
  if (type === RecordType.A) {
    return 'A'
  }

  if (type === RecordType.AAAA) {
    return 'AAAA'
  }

  if (type === RecordType.TXT) {
    return 'TXT'
  }

  if (type === RecordType.CNAME) {
    return 'CNAME'
  }

  throw new Error('Unsupported DNS record type')
}

/**
 * Uses the RFC 1035 'application/dns-message' content-type to resolve DNS
 * queries.
 *
 * This resolver needs more dependencies than the non-standard
 * DNS-JSON-over-HTTPS resolver so can result in a larger bundle size and
 * consequently is not preferred for browser use.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc1035
 * @see https://developers.cloudflare.com/1.1.1.1/encryption/dns-over-https/make-api-requests/dns-wireformat/
 * @see https://github.com/curl/curl/wiki/DNS-over-HTTPS#publicly-available-servers
 * @see https://dnsprivacy.org/public_resolvers/
 */
export function dnsOverHttps (url: string, init: DNSOverHTTPSOptions = {}): DNSResolver {
  const httpQueue = new PQueue({
    concurrency: init.queryConcurrency ?? DEFAULT_QUERY_CONCURRENCY
  })

  return async (fqdn, options = {}) => {
    const log = options?.logger?.forComponent('dns:dns-over-https')
    const types = getTypes(options.types)

    const dnsQuery = encode({
      type: 'query',
      id: 0,
      flags: RECURSION_DESIRED,
      questions: types.map(type => ({
        type: toType(type),
        name: fqdn
      }))
    })

    const searchParams = new URLSearchParams()
    searchParams.set('dns', uint8ArrayToString(dnsQuery, 'base64url'))

    options.onProgress?.(new CustomProgressEvent<string>('dns:query', fqdn))

    // query DNS over HTTPS server
    const response = await httpQueue.add(async () => {
      log?.('GET %s', `${url}?${searchParams}`)

      const res = await fetch(`${url}?${searchParams}`, {
        headers: {
          accept: 'application/dns-message'
        },
        signal: options.signal
      })

      log?.('GET %s %d', res.url, res.status)

      if (res.status !== 200) {
        throw new Error(`Unexpected HTTP status: ${res.status} - ${res.statusText}`)
      }

      const buf = await res.arrayBuffer()
      const response = toDNSResponse(decode(new Uint8Array(buf, 0, buf.byteLength)))

      options.onProgress?.(new CustomProgressEvent<DNSResponse>('dns:response', response))

      return response
    }, {
      signal: options.signal
    })

    if (response == null) {
      throw new Error('No DNS response received')
    }

    return response
  }
}
