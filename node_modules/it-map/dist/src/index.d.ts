/**
 * @packageDocumentation
 *
 * Convert one value from an (async)iterator into another.
 *
 * @example
 *
 * ```javascript
 * import map from 'it-map'
 *
 * // This can also be an iterator, generator, etc
 * const values = [0, 1, 2, 3, 4]
 *
 * const result = map(values, (val, index) => val++)
 *
 * console.info(result) // [1, 2, 3, 4, 5]
 * ```
 *
 * Async sources and transforms must be awaited:
 *
 * ```javascript
 * import map from 'it-map'
 *
 * const values = async function * () {
 *   yield * [0, 1, 2, 3, 4]
 * }
 *
 * const result = await map(values(), async (val, index) => val++)
 *
 * console.info(result) // [1, 2, 3, 4, 5]
 * ```
 */
/**
 * Takes an (async) iterable and returns one with each item mapped by the passed
 * function
 */
declare function map<I, O>(source: Iterable<I>, func: (val: I, index: number) => Promise<O>): AsyncGenerator<O, void, undefined>;
declare function map<I, O>(source: Iterable<I>, func: (val: I, index: number) => O): Generator<O, void, undefined>;
declare function map<I, O>(source: AsyncIterable<I> | Iterable<I>, func: (val: I, index: number) => O | Promise<O>): AsyncGenerator<O, void, undefined>;
export default map;
//# sourceMappingURL=index.d.ts.map