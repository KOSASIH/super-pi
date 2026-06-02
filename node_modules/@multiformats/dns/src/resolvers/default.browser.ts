import { dnsJsonOverHttps } from './dns-json-over-https.js'
import type { DNSResolver } from './index.js'

export function defaultResolver (): DNSResolver[] {
  return [
    dnsJsonOverHttps('https://cloudflare-dns.com/dns-query'),
    dnsJsonOverHttps('https://dns.google/resolve')
  ]
}
