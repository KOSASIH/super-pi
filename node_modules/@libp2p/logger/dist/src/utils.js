export function truncatePeerId(peerId, options = {}) {
    const prefixLength = options.prefixLength ?? 2;
    const suffixLength = options.suffixLength ?? 4;
    const peerIdString = peerId.toString();
    return `${peerIdString.substring(0, prefixLength)}…${peerIdString.substring(peerIdString.length, peerIdString.length - suffixLength)}`;
}
//# sourceMappingURL=utils.js.map