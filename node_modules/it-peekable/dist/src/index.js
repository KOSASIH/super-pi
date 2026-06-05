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
function peekable(iterable) {
    // @ts-expect-error can't use Symbol.asyncIterator to index iterable since it might be Iterable
    const [iterator, symbol] = iterable[Symbol.asyncIterator] != null
        // @ts-expect-error can't use Symbol.asyncIterator to index iterable since it might be Iterable
        ? [iterable[Symbol.asyncIterator](), Symbol.asyncIterator]
        // @ts-expect-error can't use Symbol.iterator to index iterable since it might be AsyncIterable
        : [iterable[Symbol.iterator](), Symbol.iterator];
    const queue = [];
    // @ts-expect-error can't use symbol to index peekable
    return {
        peek: () => {
            return iterator.next();
        },
        push: (value) => {
            queue.push(value);
        },
        next: () => {
            if (queue.length > 0) {
                return {
                    done: false,
                    value: queue.shift()
                };
            }
            return iterator.next();
        },
        [symbol]() {
            return this;
        }
    };
}
export default peekable;
//# sourceMappingURL=index.js.map