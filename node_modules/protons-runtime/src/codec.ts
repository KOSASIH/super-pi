import type { Writer, Reader } from './index.js'

// https://developers.google.com/protocol-buffers/docs/encoding#structure
export enum CODEC_TYPES {
  VARINT = 0,
  BIT64,
  LENGTH_DELIMITED,
  START_GROUP,
  END_GROUP,
  BIT32
}

export interface EncodeOptions {
  lengthDelimited?: boolean
  writeDefaults?: boolean
}

export interface EncodeFunction<T> {
  (value: Partial<T>, writer: Writer, opts?: EncodeOptions): void
}

// protobuf types that contain multiple values
type CollectionTypes = any[] | Map<any, any>

// protobuf types that are not collections or messages
type PrimitiveTypes = boolean | number | string | bigint | Uint8Array

// recursive array/map field length limits
type CollectionLimits <T> = {
  [K in keyof T]: T[K] extends CollectionTypes ? number :
    T[K] extends PrimitiveTypes ? never : Limits<T[K]>
}

// recursive array member array/map field length limits
type ArrayElementLimits <T> = {
  [K in keyof T as `${string & K}$`]: T[K] extends Array<infer ElementType> ?
      (ElementType extends PrimitiveTypes ? never : Limits<ElementType>) :
      (T[K] extends PrimitiveTypes ? never : Limits<T[K]>)
}

// recursive map value array/map field length limits
type MapValueLimits <T> = {
  [K in keyof T as `${string & K}$value`]: T[K] extends Map<any, infer MapValueType> ?
      (MapValueType extends PrimitiveTypes ? never : Limits<MapValueType>) :
      (T[K] extends PrimitiveTypes ? never : Limits<T[K]>)
}

// union of collection and array elements
type Limits<T> = Partial<CollectionLimits<T> & ArrayElementLimits<T> & MapValueLimits<T>>

export interface DecodeOptions<T> {
  /**
   * Runtime-specified limits for lengths of repeated/map fields
   */
  limits?: Limits<T>
}

export interface DecodeFunction<T> {
  (reader: Reader, length?: number, opts?: DecodeOptions<T>): T
}

export interface Codec<T> {
  name: string
  type: CODEC_TYPES
  encode: EncodeFunction<T>
  decode: DecodeFunction<T>
}

export function createCodec <T> (name: string, type: CODEC_TYPES, encode: EncodeFunction<T>, decode: DecodeFunction<T>): Codec<T> {
  return {
    name,
    type,
    encode,
    decode
  }
}
