/**
 * Compares two Uint8Arrays representing two xor distances. Returns `-1` if `a`
 * is a lower distance, `1` if `b` is a lower distance or `0` if the distances
 * are equal.
 */
export function xorCompare(a, b) {
    if (a.byteLength !== b.byteLength) {
        throw new Error('Inputs should have the same length');
    }
    for (let i = 0; i < a.byteLength; i++) {
        if (a[i] === b[i]) {
            continue;
        }
        return a[i] < b[i] ? -1 : 1;
    }
    return 0;
}
//# sourceMappingURL=xor-compare.js.map