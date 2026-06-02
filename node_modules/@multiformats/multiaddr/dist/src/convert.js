import { IpNet } from '@chainsafe/netmask';
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string';
import { toString as uint8ArrayToString } from 'uint8arrays/to-string';
import { registry } from './registry.js';
export function convertToIpNet(multiaddr) {
    let mask;
    let addr;
    multiaddr.getComponents().forEach(component => {
        if (component.name === 'ip4' || component.name === 'ip6') {
            addr = component.value;
        }
        if (component.name === 'ipcidr') {
            mask = component.value;
        }
    });
    if (mask == null || addr == null) {
        throw new Error('Invalid multiaddr');
    }
    return new IpNet(addr, mask);
}
export function convert(proto, a) {
    if (a instanceof Uint8Array) {
        return convertToString(proto, a);
    }
    else {
        return convertToBytes(proto, a);
    }
}
/**
 * Convert [code, Uint8Array] to string
 *
 * @deprecated Will be removed in a future release
 */
export function convertToString(proto, buf) {
    const protocol = registry.getProtocol(proto);
    return protocol.bytesToValue?.(buf) ?? uint8ArrayToString(buf, 'base16'); // no clue. convert to hex
}
/**
 * Convert [code, string] to Uint8Array
 *
 * @deprecated Will be removed in a future release
 */
export function convertToBytes(proto, str) {
    const protocol = registry.getProtocol(proto);
    return protocol.valueToBytes?.(str) ?? uint8ArrayFromString(str, 'base16'); // no clue. convert from hex
}
//# sourceMappingURL=convert.js.map