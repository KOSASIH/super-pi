import { pushable } from 'it-pushable'
import merge from 'it-merge'
import type { Duplex, Transform, Sink } from 'it-stream-types'

interface SourceFn<A = any> { (): A }

type PipeSource<A = any> =
  Iterable<A> |
  AsyncIterable<A> |
  SourceFn<A> |
  Duplex<A, any, any>

type PipeTransform<A = any, B = any> =
  Transform<A, B> |
  Duplex<B, A>

type PipeSink<A = any, B = any> =
  Sink<A, B> |
  Duplex<any, A, B>

type PipeOutput<A> =
  A extends Sink<any> ? ReturnType<A> :
    A extends Duplex<any, any, any> ? ReturnType<A['sink']> :
      never

// single item pipe output includes pipe source types
type SingleItemPipeOutput<A> =
  A extends Iterable<any> ? A :
    A extends AsyncIterable<any> ? A :
      A extends SourceFn ? ReturnType<A> :
        A extends Duplex<any, any, any> ? A['source'] :
          PipeOutput<A>

type PipeFnInput<A> =
  A extends Iterable<any> ? A :
    A extends AsyncIterable<any> ? A :
      A extends SourceFn ? ReturnType<A> :
        A extends Transform<any, any> ? ReturnType<A> :
          A extends Duplex<any, any, any> ? A['source'] :
            never

// one item, just a pass-through
export function pipe<
  A extends PipeSource
> (
  source: A
): SingleItemPipeOutput<A>

// two items, source to sink
export function pipe<
  A extends PipeSource,
  B extends PipeSink<PipeFnInput<A>>
> (
  source: A,
  sink: B
): PipeOutput<B>

// three items, source to sink with transform(s) in between
export function pipe<
  A extends PipeSource,
  B extends PipeTransform<PipeFnInput<A>>,
  C extends PipeSink<PipeFnInput<B>>
> (
  source: A,
  transform1: B,
  sink: C
): PipeOutput<C>

// many items, source to sink with transform(s) in between
export function pipe<
  A extends PipeSource,
  B extends PipeTransform<PipeFnInput<A>>,
  C extends PipeTransform<PipeFnInput<B>>,
  D extends PipeSink<PipeFnInput<C>>
> (
  source: A,
  transform1: B,
  transform2: C,
  sink: D
): PipeOutput<D>

// lots of items, source to sink with transform(s) in between
export function pipe<
  A extends PipeSource,
  B extends PipeTransform<PipeFnInput<A>>,
  C extends PipeTransform<PipeFnInput<B>>,
  D extends PipeTransform<PipeFnInput<C>>,
  E extends PipeSink<PipeFnInput<D>>
> (
  source: A,
  transform1: B,
  transform2: C,
  transform3: D,
  sink: E
): PipeOutput<E>

// lots of items, source to sink with transform(s) in between
export function pipe<
  A extends PipeSource,
  B extends PipeTransform<PipeFnInput<A>>,
  C extends PipeTransform<PipeFnInput<B>>,
  D extends PipeTransform<PipeFnInput<C>>,
  E extends PipeTransform<PipeFnInput<D>>,
  F extends PipeSink<PipeFnInput<E>>
> (
  source: A,
  transform1: B,
  transform2: C,
  transform3: D,
  transform4: E,
  sink: F
): PipeOutput<F>

// lots of items, source to sink with transform(s) in between
export function pipe<
  A extends PipeSource,
  B extends PipeTransform<PipeFnInput<A>>,
  C extends PipeTransform<PipeFnInput<B>>,
  D extends PipeTransform<PipeFnInput<C>>,
  E extends PipeTransform<PipeFnInput<D>>,
  F extends PipeTransform<PipeFnInput<E>>,
  G extends PipeSink<PipeFnInput<F>>
> (
  source: A,
  transform1: B,
  transform2: C,
  transform3: D,
  transform4: E,
  transform5: F,
  sink: G
): PipeOutput<G>

// lots of items, source to sink with transform(s) in between
export function pipe<
  A extends PipeSource,
  B extends PipeTransform<PipeFnInput<A>>,
  C extends PipeTransform<PipeFnInput<B>>,
  D extends PipeTransform<PipeFnInput<C>>,
  E extends PipeTransform<PipeFnInput<D>>,
  F extends PipeTransform<PipeFnInput<E>>,
  G extends PipeTransform<PipeFnInput<F>>,
  H extends PipeSink<PipeFnInput<G>>
> (
  source: A,
  transform1: B,
  transform2: C,
  transform3: D,
  transform4: E,
  transform5: F,
  transform6: G,
  sink: H
): PipeOutput<H>

// lots of items, source to sink with transform(s) in between
export function pipe<
  A extends PipeSource,
  B extends PipeTransform<PipeFnInput<A>>,
  C extends PipeTransform<PipeFnInput<B>>,
  D extends PipeTransform<PipeFnInput<C>>,
  E extends PipeTransform<PipeFnInput<D>>,
  F extends PipeTransform<PipeFnInput<E>>,
  G extends PipeTransform<PipeFnInput<F>>,
  H extends PipeTransform<PipeFnInput<G>>,
  I extends PipeSink<PipeFnInput<H>>
> (
  source: A,
  transform1: B,
  transform2: C,
  transform3: D,
  transform4: E,
  transform5: F,
  transform6: G,
  transform7: H,
  sink: I
): PipeOutput<I>

// lots of items, source to sink with transform(s) in between
export function pipe<
  A extends PipeSource,
  B extends PipeTransform<PipeFnInput<A>>,
  C extends PipeTransform<PipeFnInput<B>>,
  D extends PipeTransform<PipeFnInput<C>>,
  E extends PipeTransform<PipeFnInput<D>>,
  F extends PipeTransform<PipeFnInput<E>>,
  G extends PipeTransform<PipeFnInput<F>>,
  H extends PipeTransform<PipeFnInput<G>>,
  I extends PipeTransform<PipeFnInput<H>>,
  J extends PipeSink<PipeFnInput<I>>
> (
  source: A,
  transform1: B,
  transform2: C,
  transform3: D,
  transform4: E,
  transform5: F,
  transform6: G,
  transform7: H,
  transform8: I,
  sink: J
): PipeOutput<J>

// lots of items, source to sink with transform(s) in between
export function pipe<
  A extends PipeSource,
  B extends PipeTransform<PipeFnInput<A>>,
  C extends PipeTransform<PipeFnInput<B>>,
  D extends PipeTransform<PipeFnInput<C>>,
  E extends PipeTransform<PipeFnInput<D>>,
  F extends PipeTransform<PipeFnInput<E>>,
  G extends PipeTransform<PipeFnInput<F>>,
  H extends PipeTransform<PipeFnInput<G>>,
  I extends PipeTransform<PipeFnInput<H>>,
  J extends PipeTransform<PipeFnInput<I>>,
  K extends PipeSink<PipeFnInput<J>>
> (
  source: A,
  transform1: B,
  transform2: C,
  transform3: D,
  transform4: E,
  transform5: F,
  transform6: G,
  transform7: H,
  transform8: I,
  transform9: J,
  sink: K
): PipeOutput<K>

// lots of items, source to sink with transform(s) in between
export function pipe<
  A extends PipeSource,
  B extends PipeTransform<PipeFnInput<A>>,
  C extends PipeTransform<PipeFnInput<B>>,
  D extends PipeTransform<PipeFnInput<C>>,
  E extends PipeTransform<PipeFnInput<D>>,
  F extends PipeTransform<PipeFnInput<E>>,
  G extends PipeTransform<PipeFnInput<F>>,
  H extends PipeTransform<PipeFnInput<G>>,
  I extends PipeTransform<PipeFnInput<H>>,
  J extends PipeTransform<PipeFnInput<I>>,
  K extends PipeTransform<PipeFnInput<J>>,
  L extends PipeSink<PipeFnInput<K>>
> (
  source: A,
  transform1: B,
  transform2: C,
  transform3: D,
  transform4: E,
  transform5: F,
  transform6: G,
  transform7: H,
  transform8: I,
  transform9: J,
  transform10: K,
  sink: L
): PipeOutput<L>

export function pipe (first: any, ...rest: any[]): any {
  if (first == null) {
    throw new Error('Empty pipeline')
  }

  // Duplex at start: wrap in function and return duplex source
  if (isDuplex(first)) {
    const duplex = first
    first = () => duplex.source
  // Iterable at start: wrap in function
  } else if (isIterable(first) || isAsyncIterable(first)) {
    const source = first
    first = () => source
  }

  const fns = [first, ...rest]

  if (fns.length > 1) {
    // Duplex at end: use duplex sink
    if (isDuplex(fns[fns.length - 1])) {
      fns[fns.length - 1] = fns[fns.length - 1].sink
    }
  }

  if (fns.length > 2) {
    // Duplex in the middle, consume source with duplex sink and return duplex source
    for (let i = 1; i < fns.length - 1; i++) {
      if (isDuplex(fns[i])) {
        fns[i] = duplexPipelineFn(fns[i])
      }
    }
  }

  return rawPipe(...fns)
}

export const rawPipe = (...fns: any): any => {
  let res
  while (fns.length > 0) {
    res = fns.shift()(res)
  }
  return res
}

const isAsyncIterable = (obj: any): obj is AsyncIterable<unknown> => {
  return obj?.[Symbol.asyncIterator] != null
}

const isIterable = (obj: any): obj is Iterable<unknown> => {
  return obj?.[Symbol.iterator] != null
}

const isDuplex = (obj: any): obj is Duplex => {
  if (obj == null) {
    return false
  }

  return obj.sink != null && obj.source != null
}

const duplexPipelineFn = (duplex: Duplex<any, any, any>) => {
  return (source: any) => {
    const p = duplex.sink(source)

    if (p?.then != null) {
      const stream = pushable<any>({
        objectMode: true
      })
      p.then(() => {
        stream.end()
      }, (err: Error) => {
        stream.end(err)
      })

      let sourceWrap: () => Iterable<any> | AsyncIterable<any>
      const source = duplex.source

      if (isAsyncIterable(source)) {
        sourceWrap = async function * () {
          yield * source
          stream.end()
        }
      } else if (isIterable(source)) {
        sourceWrap = function * () {
          yield * source
          stream.end()
        }
      } else {
        throw new Error('Unknown duplex source type - must be Iterable or AsyncIterable')
      }

      return merge(stream, sourceWrap())
    }

    return duplex.source
  }
}
