import { isLoopbackAddr } from 'is-loopback-addr';
/**
 * Check if a given multiaddr is a loopback address.
 */
export function isLoopback(ma) {
    const { address } = ma.nodeAddress();
    return isLoopbackAddr(address);
}
//# sourceMappingURL=is-loopback.js.map