import { dnsJsonOverHttps } from './dns-json-over-https.js';
export function defaultResolver() {
    return [
        dnsJsonOverHttps('https://cloudflare-dns.com/dns-query'),
        dnsJsonOverHttps('https://dns.google/resolve')
    ];
}
//# sourceMappingURL=default.browser.js.map