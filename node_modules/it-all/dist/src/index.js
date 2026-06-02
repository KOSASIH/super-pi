/**
 * @packageDocumentation
 *
 * For when you need a one-liner to collect iterable values.
 *
 * @example
 *
 * ```javascript
 * import all from 'it-all'
 *
 * // This can also be an iterator, etc
 * const values = function * () {
 *   yield * [0, 1, 2, 3, 4]
 * }
 *
 * const arr = all(values)
 *
 * console.info(arr) // 0, 1, 2, 3, 4
 * ```
 *
 * Async sources must be awaited:
 *
 * ```javascript
 * const values = async function * () {
 *   yield * [0, 1, 2, 3, 4]
 * }
 *
 * const arr = await all(values())
 *
 * console.info(arr) // 0, 1, 2, 3, 4
 * ```
 */
function isAsyncIterable(thing) {
    return thing[Symbol.asyncIterator] != null;
}
function all(source) {
    if (isAsyncIterable(source)) {
        return (async () => {
            const arr = [];
            for await (const entry of source) {
                arr.push(entry);
            }
            return arr;
        })();
    }
    const arr = [];
    for (const entry of source) {
        arr.push(entry);
    }
    return arr;
}
export default all;
//# sourceMappingURL=index.js.map