/**
 * @packageDocumentation
 *
 * A standard way to represent addresses that
 *
 * - support any standard network protocol
 * - are self-describing
 * - have a binary packed format
 * - have a nice string representation
 * - encapsulate well
 *
 * @example
 *
 * ```TypeScript
 * import { multiaddr } from '@multiformats/multiaddr'
 *
 * const addr = multiaddr('/ip4/127.0.0.1/udp/1234')
 * // Multiaddr(/ip4/127.0.0.1/udp/1234)
 *
 * addr.bytes
 * // <Uint8Array 04 7f 00 00 01 11 04 d2>
 *
 * addr.toString()
 * // '/ip4/127.0.0.1/udp/1234'
 *
 * addr.protos()
 * // [
 * //   {code: 4, name: 'ip4', size: 32},
 * //   {code: 273, name: 'udp', size: 16}
 * // ]
 *
 * // gives you an object that is friendly with what Node.js core modules expect for addresses
 * addr.nodeAddress()
 * // {
 * //   family: 4,
 * //   port: 1234,
 * //   address: "127.0.0.1"
 * // }
 *
 * addr.encapsulate('/sctp/5678')
 * // Multiaddr(/ip4/127.0.0.1/udp/1234/sctp/5678)
 * ```
 *
 * ## Resolving DNSADDR addresses
 *
 * [DNSADDR](https://github.com/multiformats/multiaddr/blob/master/protocols/DNSADDR.md) is a spec that allows storing a TXT DNS record that contains a Multiaddr.
 *
 * To resolve DNSADDR addresses, call the `.resolve()` function the multiaddr, optionally passing a `DNS` resolver.
 *
 * DNSADDR addresses can resolve to multiple multiaddrs, since there is no limit to the number of TXT records that can be stored.
 *
 * @example Resolving DNSADDR Multiaddrs
 *
 * ```TypeScript
 * import { multiaddr, resolvers } from '@multiformats/multiaddr'
 * import { dnsaddrResolver } from '@multiformats/multiaddr/resolvers'
 *
 * resolvers.set('dnsaddr', dnsaddrResolver)
 *
 * const ma = multiaddr('/dnsaddr/bootstrap.libp2p.io')
 *
 * // resolve with a 5s timeout
 * const resolved = await ma.resolve({
 *   signal: AbortSignal.timeout(5000)
 * })
 *
 * console.info(resolved)
 * // [Multiaddr('/ip4/147.75...'), Multiaddr('/ip4/147.75...'), Multiaddr('/ip4/147.75...')...]
 * ```
 *
 * @example Using a custom DNS resolver to resolve DNSADDR Multiaddrs
 *
 * See the docs for [@multiformats/dns](https://www.npmjs.com/package/@multiformats/dns) for a full breakdown of how to specify multiple resolvers or resolvers that can be used for specific TLDs.
 *
 * ```TypeScript
 * import { multiaddr } from '@multiformats/multiaddr'
 * import { dns } from '@multiformats/dns'
 * import { dnsJsonOverHttps } from '@multiformats/dns/resolvers'
 *
 * const resolver = dns({
 *   resolvers: {
 *     '.': dnsJsonOverHttps('https://cloudflare-dns.com/dns-query')
 *   }
 * })
 *
 * const ma = multiaddr('/dnsaddr/bootstrap.libp2p.io')
 * const resolved = await ma.resolve({
 *  dns: resolver
 * })
 *
 * console.info(resolved)
 * // [Multiaddr('/ip4/147.75...'), Multiaddr('/ip4/147.75...'), Multiaddr('/ip4/147.75...')...]
 * ```
 *
 * @example Adding custom protocols
 *
 * To add application-specific or experimental protocols, add a protocol codec
 * to the protocol registry:
 *
 * ```ts
 * import { registry, V, multiaddr } from '@multiformats/multiaddr'
 * import type { ProtocolCodec } from '@multiformats/multiaddr'
 *
 * const maWithCustomTuple = '/custom-protocol/hello'
 *
 * // throws UnknownProtocolError
 * multiaddr(maWithCustomTuple)
 *
 * const protocol: ProtocolCodec = {
 *   code: 2059,
 *   name: 'custom-protocol',
 *   size: V
 *   // V means variable length, can also be 0, a positive integer (e.g. a fixed
 *   // length or omitted
 * }
 *
 * registry.addProtocol(protocol)
 *
 * // does not throw UnknownProtocolError
 * multiaddr(maWithCustomTuple)
 *
 * // protocols can also be removed
 * registry.removeProtocol(protocol.code)
 * ```
 */
import { toString as uint8ArrayToString } from 'uint8arrays/to-string';
import { InvalidParametersError } from "./errors.js";
import { Multiaddr as MultiaddrClass, symbol } from './multiaddr.js';
import { registry, V } from "./registry.js";
/**
 * All configured {@link Resolver}s
 *
 * @deprecated DNS resolving will be removed in a future release
 */
export const resolvers = new Map();
export { MultiaddrFilter } from './filter/multiaddr-filter.js';
/**
 * Creates a Multiaddr from a node-friendly address object
 *
 * @example
 * ```js
 * import { fromNodeAddress } from '@multiformats/multiaddr'
 *
 * fromNodeAddress({address: '127.0.0.1', port: '4001'}, 'tcp')
 * // Multiaddr(/ip4/127.0.0.1/tcp/4001)
 * ```
 */
export function fromNodeAddress(addr, transport) {
    if (addr == null) {
        throw new InvalidParametersError('requires node address object');
    }
    if (transport == null) {
        throw new InvalidParametersError('requires transport protocol');
    }
    let ip;
    let host = addr.address;
    switch (addr.family) {
        case 4:
            ip = 'ip4';
            break;
        case 6:
            ip = 'ip6';
            if (host.includes('%')) {
                const parts = host.split('%');
                if (parts.length !== 2) {
                    throw Error('Multiple ip6 zones in multiaddr');
                }
                host = parts[0];
                const zone = parts[1];
                ip = `ip6zone/${zone}/ip6`;
            }
            break;
        default:
            throw Error('Invalid addr family, should be 4 or 6.');
    }
    return new MultiaddrClass('/' + [ip, host, transport, addr.port].join('/'));
}
/**
 * Create a {@link Multiaddr} from an array of {@link Tuple}s
 *
 * @example
 *
 * ```ts
 * import { fromTuples, multiaddr } from '@multiformats/multiaddr'
 *
 * const ma = multiaddr('/ip4/127.0.0.1')
 * const tuples = ma.tuples()
 *
 * const ma2 = fromTuples(tuples)
 *
 * console.info(ma2)
 * // '/ip4/127.0.0.1'
 * ```
 *
 * @deprecated Will be removed in a future release
 */
export function fromTuples(tuples) {
    return multiaddr(tuples.map(([code, value]) => {
        const codec = registry.getProtocol(code);
        const component = {
            code,
            name: codec.name
        };
        if (value != null) {
            component.value = codec.bytesToValue?.(value) ?? uint8ArrayToString(value);
        }
        return component;
    }));
}
/**
 * Create a {@link Multiaddr} from an array of {@link StringTuple}s
 *
 * @example
 *
 * ```ts
 * import { fromStringTuples, multiaddr } from '@multiformats/multiaddr'
 *
 * const ma = multiaddr('/ip4/127.0.0.1')
 * const tuples = ma.stringTuples()
 *
 * const ma2 = fromStringTuples(tuples)
 *
 * console.info(ma2)
 * // '/ip4/127.0.0.1'
 * ```
 *
 * @deprecated Will be removed in a future release
 */
export function fromStringTuples(tuples) {
    return multiaddr(tuples.map(([code, value]) => {
        const codec = registry.getProtocol(code);
        const component = {
            code,
            name: codec.name
        };
        if (value != null) {
            component.value = value;
        }
        return component;
    }));
}
/**
 * Returns if something is a {@link Multiaddr} that is a resolvable name
 *
 * @example
 *
 * ```js
 * import { isName, multiaddr } from '@multiformats/multiaddr'
 *
 * isName(multiaddr('/ip4/127.0.0.1'))
 * // false
 * isName(multiaddr('/dns/ipfs.io'))
 * // true
 * ```
 *
 * @deprecated DNS resolving will be removed in a future release
 */
export function isName(addr) {
    if (!isMultiaddr(addr)) {
        return false;
    }
    // if a part of the multiaddr is resolvable, then return true
    return addr.protos().some((proto) => proto.resolvable);
}
/**
 * Check if object is a {@link Multiaddr} instance
 *
 * @example
 *
 * ```js
 * import { isMultiaddr, multiaddr } from '@multiformats/multiaddr'
 *
 * isMultiaddr(5)
 * // false
 * isMultiaddr(multiaddr('/ip4/127.0.0.1'))
 * // true
 * ```
 */
export function isMultiaddr(value) {
    return Boolean(value?.[symbol]);
}
/**
 * A function that takes a {@link MultiaddrInput} and returns a {@link Multiaddr}
 *
 * @example
 * ```js
 * import { multiaddr } from '@libp2p/multiaddr'
 *
 * multiaddr('/ip4/127.0.0.1/tcp/4001')
 * // Multiaddr(/ip4/127.0.0.1/tcp/4001)
 * ```
 *
 * @param {MultiaddrInput} [addr] - If String or Uint8Array, needs to adhere to the address format of a [multiaddr](https://github.com/multiformats/multiaddr#string-format)
 */
export function multiaddr(addr) {
    return new MultiaddrClass(addr);
}
/**
 * For the passed proto string or number, return a {@link Protocol}
 *
 * @example
 *
 * ```js
 * import { protocol } from '@multiformats/multiaddr'
 *
 * console.info(protocol(4))
 * // { code: 4, size: 32, name: 'ip4', resolvable: false, path: false }
 * ```
 *
 * @deprecated This will be removed in a future version
 */
export function protocols(proto) {
    const codec = registry.getProtocol(proto);
    return {
        code: codec.code,
        size: codec.size ?? 0,
        name: codec.name,
        resolvable: Boolean(codec.resolvable),
        path: Boolean(codec.path)
    };
}
/**
 * Export all table.csv codes. These are all named exports so can be tree-shaken
 * out by bundlers.
 */
export * from "./constants.js";
export { registry, V };
//# sourceMappingURL=index.js.map