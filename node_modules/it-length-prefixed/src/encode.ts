import * as varint from 'uint8-varint'
import { Uint8ArrayList } from 'uint8arraylist'
import { allocUnsafe } from 'uint8arrays/alloc'
import { isAsyncIterable } from './utils.js'
import type { LengthEncoderFunction } from './index.js'
import type { Source } from 'it-stream-types'

interface EncoderOptions {
  lengthEncoder?: LengthEncoderFunction
}

const defaultEncoder: LengthEncoderFunction = (length) => {
  const lengthLength = varint.encodingLength(length)
  const lengthBuf = allocUnsafe(lengthLength)

  varint.encode(length, lengthBuf)

  defaultEncoder.bytes = lengthLength

  return lengthBuf
}
defaultEncoder.bytes = 0

export function encode (source: Iterable<Uint8ArrayList | Uint8Array>, options?: EncoderOptions): Generator<Uint8Array, void, undefined>
export function encode (source: Source<Uint8ArrayList | Uint8Array>, options?: EncoderOptions): AsyncGenerator<Uint8Array, void, undefined>
export function encode (source: Source<Uint8ArrayList | Uint8Array>, options?: EncoderOptions): Generator<Uint8Array, void, undefined> | AsyncGenerator<Uint8Array, void, undefined> {
  options = options ?? {}

  const encodeLength = options.lengthEncoder ?? defaultEncoder

  function * maybeYield (chunk: Uint8Array | Uint8ArrayList): Generator<Uint8Array, void, undefined> {
    // length + data
    const length = encodeLength(chunk.byteLength)

    // yield only Uint8Arrays
    if (length instanceof Uint8Array) {
      yield length
    } else {
      yield * length
    }

    // yield only Uint8Arrays
    if (chunk instanceof Uint8Array) {
      yield chunk
    } else {
      yield * chunk
    }
  }

  if (isAsyncIterable(source)) {
    return (async function * () {
      for await (const chunk of source) {
        yield * maybeYield(chunk)
      }
    })()
  }

  return (function * () {
    for (const chunk of source) {
      yield * maybeYield(chunk)
    }
  })()
}

encode.single = (chunk: Uint8ArrayList | Uint8Array, options?: EncoderOptions) => {
  options = options ?? {}
  const encodeLength = options.lengthEncoder ?? defaultEncoder

  return new Uint8ArrayList(
    encodeLength(chunk.byteLength),
    chunk
  )
}
