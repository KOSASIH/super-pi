import type { DNSResponse, QueryOptions } from '../index.js'

export interface DNSResolver {
  (domain: string, options?: QueryOptions): Promise<DNSResponse>
}

export { dnsOverHttps } from './dns-over-https.js'
export { dnsJsonOverHttps } from './dns-json-over-https.js'
