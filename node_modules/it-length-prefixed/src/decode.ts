/* eslint max-depth: ["error", 6] */

import * as varint from 'uint8-varint'
import { Uint8ArrayList } from 'uint8arraylist'
import { InvalidDataLengthError, InvalidDataLengthLengthError, InvalidMessageLengthError, UnexpectedEOFError } from './errors.js'
import { isAsyncIterable } from './utils.js'
import type { LengthDecoderFunction } from './index.js'
import type { Reader } from 'it-reader'
import type { Source } from 'it-stream-types'

export interface ReadState {
  dataLength: number
}

export interface DecoderOptions {
  lengthDecoder?: LengthDecoderFunction
  onData?(data: Uint8ArrayList): void
  onLength?(length: number): void
  maxLengthLength?: number
  maxDataLength?: number
}

export interface ReadResult {
  mode: string
  chunk?: Uint8ArrayList
  buffer: Uint8ArrayList
  state?: ReadState
  data?: Uint8ArrayList
}

// Maximum length of the length section of the message
export const MAX_LENGTH_LENGTH = 8 // Varint.encode(Number.MAX_SAFE_INTEGER).length
// Maximum length of the data section of the message
export const MAX_DATA_LENGTH = 1024 * 1024 * 4

enum ReadMode {
  LENGTH,
  DATA
}

const defaultDecoder: LengthDecoderFunction = (buf) => {
  const length = varint.decode(buf)
  defaultDecoder.bytes = varint.encodingLength(length)

  return length
}
defaultDecoder.bytes = 0

export function decode (source: Iterable<Uint8ArrayList | Uint8Array>, options?: DecoderOptions): Generator<Uint8ArrayList, void, unknown>
export function decode (source: Source<Uint8ArrayList | Uint8Array>, options?: DecoderOptions): AsyncGenerator<Uint8ArrayList, void, unknown>
export function decode (source: Source<Uint8ArrayList | Uint8Array>, options?: DecoderOptions): Generator<Uint8ArrayList, void, unknown> | AsyncGenerator<Uint8ArrayList, void, unknown> {
  const buffer = new Uint8ArrayList()
  let mode = ReadMode.LENGTH
  let dataLength = -1

  const lengthDecoder = options?.lengthDecoder ?? defaultDecoder
  const maxLengthLength = options?.maxLengthLength ?? MAX_LENGTH_LENGTH
  const maxDataLength = options?.maxDataLength ?? MAX_DATA_LENGTH

  function * maybeYield (): Generator<Uint8ArrayList> {
    while (buffer.byteLength > 0) {
      if (mode === ReadMode.LENGTH) {
        // read length, ignore errors for short reads
        try {
          dataLength = lengthDecoder(buffer)

          if (dataLength < 0) {
            throw new InvalidMessageLengthError('Invalid message length')
          }

          if (dataLength > maxDataLength) {
            throw new InvalidDataLengthError('Message length too long')
          }

          const dataLengthLength = lengthDecoder.bytes
          buffer.consume(dataLengthLength)

          if (options?.onLength != null) {
            options.onLength(dataLength)
          }

          mode = ReadMode.DATA
        } catch (err: any) {
          if (err instanceof RangeError) {
            if (buffer.byteLength > maxLengthLength) {
              throw new InvalidDataLengthLengthError('Message length length too long')
            }

            break
          }

          throw err
        }
      }

      if (mode === ReadMode.DATA) {
        if (buffer.byteLength < dataLength) {
          // not enough data, wait for more
          break
        }

        const data = buffer.sublist(0, dataLength)
        buffer.consume(dataLength)

        if (options?.onData != null) {
          options.onData(data)
        }

        yield data

        mode = ReadMode.LENGTH
      }
    }
  }

  if (isAsyncIterable(source)) {
    return (async function * () {
      for await (const buf of source) {
        buffer.append(buf)

        yield * maybeYield()
      }

      if (buffer.byteLength > 0) {
        throw new UnexpectedEOFError('Unexpected end of input')
      }
    })()
  }

  return (function * () {
    for (const buf of source) {
      buffer.append(buf)

      yield * maybeYield()
    }

    if (buffer.byteLength > 0) {
      throw new UnexpectedEOFError('Unexpected end of input')
    }
  })()
}

decode.fromReader = (reader: Reader, options?: DecoderOptions) => {
  let byteLength = 1 // Read single byte chunks until the length is known

  const varByteSource = (async function * () {
    while (true) {
      try {
        const { done, value } = await reader.next(byteLength)

        if (done === true) {
          return
        }

        if (value != null) {
          yield value
        }
      } catch (err: any) {
        if (err.code === 'ERR_UNDER_READ') {
          return { done: true, value: null }
        }
        throw err
      } finally {
        // Reset the byteLength so we continue to check for varints
        byteLength = 1
      }
    }
  }())

  /**
   * Once the length has been parsed, read chunk for that length
   */
  const onLength = (l: number): void => { byteLength = l }
  return decode(varByteSource, {
    ...(options ?? {}),
    onLength
  })
}
