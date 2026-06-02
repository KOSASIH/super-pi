
// If the passed object is an (async) iterable, then get the iterator
// If it's probably an iterator already (i.e. has next function) return it
// else throw
export function getIterator <T> (obj: AsyncIterable<T>): AsyncIterator<T>
export function getIterator <T> (obj: AsyncIterator<T>): AsyncIterator<T>
export function getIterator <T> (obj: Iterable<T>): Iterator<T>
export function getIterator <T> (obj: Iterator<T>): Iterator<T>
export function getIterator <T> (obj: any): AsyncIterator<T> | Iterator <T>
export function getIterator <T> (obj: any): AsyncIterator<T> | Iterator <T> {
  if (obj != null) {
    if (typeof obj[Symbol.iterator] === 'function') {
      return obj[Symbol.iterator]()
    }
    if (typeof obj[Symbol.asyncIterator] === 'function') {
      return obj[Symbol.asyncIterator]()
    }
    if (typeof obj.next === 'function') {
      return obj // probably an iterator
    }
  }
  throw new Error('argument is not an iterator or iterable')
}
