/**
 * @packageDocumentation
 *
 * Filter values out of an (async)iterable
 *
 * @example
 *
 * ```javascript
 * import all from 'it-all'
 * import filter from 'it-filter'
 *
 * // This can also be an iterator, generator, etc
 * const values = [0, 1, 2, 3, 4]
 *
 * const fn = (val, index) => val > 2 // Return boolean to keep item
 *
 * const arr = all(filter(values, fn))
 *
 * console.info(arr) // 3, 4
 * ```
 *
 * Async sources and filter functions must be awaited:
 *
 * ```javascript
 * import all from 'it-all'
 * import filter from 'it-filter'
 *
 * const values = async function * () {
 *   yield * [0, 1, 2, 3, 4]
 * }
 *
 * const fn = async val => (val, index) > 2 // Return boolean or promise of boolean to keep item
 *
 * const arr = await all(filter(values, fn))
 *
 * console.info(arr) // 3, 4
 * ```
 */
/**
 * Filters the passed (async) iterable by using the filter function
 */
declare function filter<T>(source: Iterable<T>, fn: (val: T, index: number) => Promise<boolean>): AsyncGenerator<T, void, undefined>;
declare function filter<T>(source: Iterable<T>, fn: (val: T, index: number) => boolean): Generator<T, void, undefined>;
declare function filter<T>(source: Iterable<T> | AsyncIterable<T>, fn: (val: T, index: number) => boolean | Promise<boolean>): AsyncGenerator<T, void, undefined>;
export default filter;
//# sourceMappingURL=index.d.ts.map