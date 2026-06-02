import type { Writer, Reader } from './index.js';
export declare enum CODEC_TYPES {
    VARINT = 0,
    BIT64 = 1,
    LENGTH_DELIMITED = 2,
    START_GROUP = 3,
    END_GROUP = 4,
    BIT32 = 5
}
export interface EncodeOptions {
    lengthDelimited?: boolean;
    writeDefaults?: boolean;
}
export interface EncodeFunction<T> {
    (value: Partial<T>, writer: Writer, opts?: EncodeOptions): void;
}
type CollectionTypes = any[] | Map<any, any>;
type PrimitiveTypes = boolean | number | string | bigint | Uint8Array;
type CollectionLimits<T> = {
    [K in keyof T]: T[K] extends CollectionTypes ? number : T[K] extends PrimitiveTypes ? never : Limits<T[K]>;
};
type ArrayElementLimits<T> = {
    [K in keyof T as `${string & K}$`]: T[K] extends Array<infer ElementType> ? (ElementType extends PrimitiveTypes ? never : Limits<ElementType>) : (T[K] extends PrimitiveTypes ? never : Limits<T[K]>);
};
type MapValueLimits<T> = {
    [K in keyof T as `${string & K}$value`]: T[K] extends Map<any, infer MapValueType> ? (MapValueType extends PrimitiveTypes ? never : Limits<MapValueType>) : (T[K] extends PrimitiveTypes ? never : Limits<T[K]>);
};
type Limits<T> = Partial<CollectionLimits<T> & ArrayElementLimits<T> & MapValueLimits<T>>;
export interface DecodeOptions<T> {
    /**
     * Runtime-specified limits for lengths of repeated/map fields
     */
    limits?: Limits<T>;
}
export interface DecodeFunction<T> {
    (reader: Reader, length?: number, opts?: DecodeOptions<T>): T;
}
export interface Codec<T> {
    name: string;
    type: CODEC_TYPES;
    encode: EncodeFunction<T>;
    decode: DecodeFunction<T>;
}
export declare function createCodec<T>(name: string, type: CODEC_TYPES, encode: EncodeFunction<T>, decode: DecodeFunction<T>): Codec<T>;
export {};
//# sourceMappingURL=codec.d.ts.map