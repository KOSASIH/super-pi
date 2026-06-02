/**
 * @packageDocumentation
 *
 * Lets you look at the contents of an async iterator and decide what to do
 *
 * @example
 *
 * ```javascript
 * import peekable from 'it-peekable'
 *
 * // This can also be an iterator, generator, etc
 * const values = [0, 1, 2, 3, 4]
 *
 * const it = peekable(value)
 *
 * const first = it.peek()
 *
 * console.info(first) // 0
 *
 * it.push(first)
 *
 * console.info([...it])
 * // [ 0, 1, 2, 3, 4 ]
 * ```
 *
 * Async sources must be awaited:
 *
 * ```javascript
 * import peekable from 'it-peekable'
 *
 * const values = async function * () {
 *   yield * [0, 1, 2, 3, 4]
 * }
 *
 * const it = peekable(values())
 *
 * const first = await it.peek()
 *
 * console.info(first) // 0
 *
 * it.push(first)
 *
 * console.info(await all(it))
 * // [ 0, 1, 2, 3, 4 ]
 * ```
 */
export interface Peek<T> {
    peek(): IteratorResult<T, undefined>;
}
export interface AsyncPeek<T> {
    peek(): Promise<IteratorResult<T, undefined>>;
}
export interface Push<T> {
    push(value: T): void;
}
export type Peekable<T> = Iterable<T> & Peek<T> & Push<T> & Iterator<T>;
export type AsyncPeekable<T> = AsyncIterable<T> & AsyncPeek<T> & Push<T> & AsyncIterator<T>;
declare function peekable<T>(iterable: Iterable<T>): Peekable<T>;
declare function peekable<T>(iterable: AsyncIterable<T>): AsyncPeekable<T>;
export default peekable;
//# sourceMappingURL=index.d.ts.map