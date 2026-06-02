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
/**
 * Collects all values from an (async) iterable and returns them as an array
 */
declare function all<T>(source: Iterable<T>): T[];
declare function all<T>(source: Iterable<T> | AsyncIterable<T>): Promise<T[]>;
export default all;
//# sourceMappingURL=index.d.ts.map