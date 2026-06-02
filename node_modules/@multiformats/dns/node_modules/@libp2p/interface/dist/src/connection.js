export const connectionSymbol = Symbol.for('@libp2p/connection');
export function isConnection(other) {
    return other != null && Boolean(other[connectionSymbol]);
}
//# sourceMappingURL=connection.js.map