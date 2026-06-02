/**
 * @packageDocumentation
 *
 * Takes an (async) iterable that emits promise-returning functions, invokes them in parallel up to the concurrency limit and emits the results as they become available, optionally in the same order as the input
 *
 * @example
 *
 * ```javascript
 * import parallel from 'it-parallel'
 * import all from 'it-all'
 * import delay from 'delay'
 *
 * // This can also be an iterator, async iterator, generator, etc
 * const input = [
 *   async () => {
 *     console.info('start 1')
 *     await delay(500)
 *
 *     console.info('end 1')
 *     return 1
 *   },
 *   async () => {
 *     console.info('start 2')
 *     await delay(200)
 *
 *     console.info('end 2')
 *     return 2
 *   },
 *   async () => {
 *     console.info('start 3')
 *     await delay(100)
 *
 *     console.info('end 3')
 *     return 3
 *   }
 * ]
 *
 * const result = await all(parallel(input, {
 *   concurrency: 2
 * }))
 *
 * // output:
 * // start 1
 * // start 2
 * // end 2
 * // start 3
 * // end 3
 * // end 1
 *
 * console.info(result) // [2, 3, 1]
 * ```
 *
 * If order is important, pass `ordered: true` as an option:
 *
 * ```javascript
 * const result = await all(parallel(input, {
 *   concurrency: 2,
 *   ordered: true
 * }))
 *
 * // output:
 * // start 1
 * // start 2
 * // end 2
 * // start 3
 * // end 3
 * // end 1
 *
 * console.info(result) // [1, 2, 3]
 * ```
 */
export interface ParallelOptions {
    /**
     * How many jobs to execute in parallel (default: )
     */
    concurrency?: number;
    ordered?: boolean;
}
/**
 * Takes an (async) iterator that emits promise-returning functions,
 * invokes them in parallel and emits the results as they become available but
 * in the same order as the input
 */
export default function parallel<T>(source: Iterable<() => Promise<T>> | AsyncIterable<() => Promise<T>>, options?: ParallelOptions): AsyncGenerator<T, void, undefined>;
//# sourceMappingURL=index.d.ts.map