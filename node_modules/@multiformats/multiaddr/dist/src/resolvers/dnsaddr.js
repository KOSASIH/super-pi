import { dns, RecordType } from '@multiformats/dns';
import { multiaddr } from '../index.js';
import { getProtocol } from '../protocols-table.js';
const MAX_RECURSIVE_DEPTH = 32;
const { code: dnsaddrCode } = getProtocol('dnsaddr');
class RecursionLimitError extends Error {
    constructor(message = 'Max recursive depth reached') {
        super(message);
        this.name = 'RecursionLimitError';
    }
}
/**
 * @deprecated DNS resolving will be removed in a future release
 */
export const dnsaddrResolver = async function dnsaddrResolver(ma, options = {}) {
    const recursionLimit = options.maxRecursiveDepth ?? MAX_RECURSIVE_DEPTH;
    if (recursionLimit === 0) {
        throw new RecursionLimitError('Max recursive depth reached');
    }
    const [, hostname] = ma.stringTuples().find(([proto]) => proto === dnsaddrCode) ?? [];
    const resolver = options?.dns ?? dns();
    const result = await resolver.query(`_dnsaddr.${hostname}`, {
        signal: options?.signal,
        types: [
            RecordType.TXT
        ]
    });
    const peerId = ma.getPeerId();
    const output = [];
    for (const answer of result.Answer) {
        const addr = answer.data
            .replace(/["']/g, '')
            .trim()
            .split('=')[1];
        if (addr == null) {
            continue;
        }
        if (peerId != null && !addr.includes(peerId)) {
            continue;
        }
        const ma = multiaddr(addr);
        if (addr.startsWith('/dnsaddr')) {
            const resolved = await ma.resolve({
                ...options,
                maxRecursiveDepth: recursionLimit - 1
            });
            output.push(...resolved.map(ma => ma.toString()));
        }
        else {
            output.push(ma.toString());
        }
    }
    return output;
};
//# sourceMappingURL=dnsaddr.js.map