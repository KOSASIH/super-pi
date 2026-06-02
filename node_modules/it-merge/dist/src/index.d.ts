/**
 * @packageDocumentation
 *
 * Merge several (async)iterables into one, yield values as they arrive.
 *
 * Nb. sources are iterated over in parallel so the order of emitted items is not guaranteed.
 *
 * @example
 *
 * ```javascript
 * import merge from 'it-merge'
 * import all from 'it-all'
 *
 * // This can also be an iterator, generator, etc
 * const values1 = [0, 1, 2, 3, 4]
 * const values2 = [5, 6, 7, 8, 9]
 *
 * const arr = all(merge(values1, values2))
 *
 * console.info(arr) // 0, 1, 2, 3, 4, 5, 6, 7, 8, 9
 * ```
 *
 * Async sources must be awaited:
 *
 * ```javascript
 * import merge from 'it-merge'
 * import all from 'it-all'
 *
 * // This can also be an iterator, async iterator, generator, etc
 * const values1 = async function * () {
 *   yield * [0, 1, 2, 3, 4]
 * }
 * const values2 = async function * () {
 *   yield * [5, 6, 7, 8, 9]
 * }
 *
 * const arr = await all(merge(values1(), values2()))
 *
 * console.info(arr) // 0, 1, 5, 6, 2, 3, 4, 7, 8, 9  <- nb. order is not guaranteed
 * ```
 */
/**
 * Treat one or more iterables as a single iterable.
 *
 * Nb. sources are iterated over in parallel so the
 * order of emitted items is not guaranteed.
 */
declare function merge<T>(...sources: Array<Iterable<T>>): Generator<T, void, undefined>;
declare function merge<T>(...sources: Array<AsyncIterable<T> | Iterable<T>>): AsyncGenerator<T, void, undefined>;
export default merge;
//# sourceMappingURL=index.d.ts.map