/**
 * All PeerId implementations must use this symbol as the name of a property
 * with a boolean `true` value
 */
export const peerIdSymbol = Symbol.for('@libp2p/peer-id');
/**
 * Returns true if the passed argument is a PeerId implementation
 */
export function isPeerId(other) {
    return Boolean(other?.[peerIdSymbol]);
}
//# sourceMappingURL=peer-id.js.map