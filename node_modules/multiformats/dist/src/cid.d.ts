import type * as API from './link/interface.js';
export * from './link/interface.js';
export declare function format<T extends API.Link<unknown, number, number, API.Version>, Prefix extends string>(link: T, base?: API.MultibaseEncoder<Prefix>): API.ToString<T, Prefix>;
export declare function toJSON<Link extends API.UnknownLink>(link: Link): API.LinkJSON<Link>;
export declare function fromJSON<Link extends API.UnknownLink>(json: API.LinkJSON<Link>): CID<unknown, number, number, API.Version>;
export declare class CID<Data = unknown, Format extends number = number, Alg extends number = number, Version extends API.Version = API.Version> implements API.Link<Data, Format, Alg, Version> {
    readonly code: Format;
    readonly version: Version;
    readonly multihash: API.MultihashDigest<Alg>;
    readonly bytes: Uint8Array;
    readonly '/': Uint8Array;
    /**
     * @param version - Version of the CID
     * @param code - Code of the codec content is encoded in, see https://github.com/multiformats/multicodec/blob/master/table.csv
     * @param multihash - (Multi)hash of the of the content.
     */
    constructor(version: Version, code: Format, multihash: API.MultihashDigest<Alg>, bytes: Uint8Array);
    /**
     * Signalling `cid.asCID === cid` has been replaced with `cid['/'] === cid.bytes`
     * please either use `CID.asCID(cid)` or switch to new signalling mechanism
     *
     * @deprecated
     */
    get asCID(): this;
    get byteOffset(): number;
    get byteLength(): number;
    toV0(): CID<Data, API.DAG_PB, API.SHA_256, 0>;
    toV1(): CID<Data, Format, Alg, 1>;
    equals(other: unknown): other is CID<Data, Format, Alg, Version>;
    static equals<Data, Format extends number, Alg extends number, Version extends API.Version>(self: API.Link<Data, Format, Alg, Version>, other: unknown): other is CID;
    toString(base?: API.MultibaseEncoder<string>): string;
    toJSON(): API.LinkJSON<this>;
    link(): this;
    readonly [Symbol.toStringTag] = "CID";
    /**
     * Takes any input `value` and returns a `CID` instance if it was
     * a `CID` otherwise returns `null`. If `value` is instanceof `CID`
     * it will return value back. If `value` is not instance of this CID
     * class, but is compatible CID it will return new instance of this
     * `CID` class. Otherwise returns null.
     *
     * This allows two different incompatible versions of CID library to
     * co-exist and interop as long as binary interface is compatible.
     */
    static asCID<Data, Format extends number, Alg extends number, Version extends API.Version, U>(input: API.Link<Data, Format, Alg, Version> | U): CID<Data, Format, Alg, Version> | null;
    /**
     * @param version - Version of the CID
     * @param code - Code of the codec content is encoded in, see https://github.com/multiformats/multicodec/blob/master/table.csv
     * @param digest - (Multi)hash of the of the content.
     */
    static create<Data, Format extends number, Alg extends number, Version extends API.Version>(version: Version, code: Format, digest: API.MultihashDigest<Alg>): CID<Data, Format, Alg, Version>;
    /**
     * Simplified version of `create` for CIDv0.
     */
    static createV0<T = unknown>(digest: API.MultihashDigest<typeof SHA_256_CODE>): CID<T, typeof DAG_PB_CODE, typeof SHA_256_CODE, 0>;
    /**
     * Simplified version of `create` for CIDv1.
     *
     * @param code - Content encoding format code.
     * @param digest - Multihash of the content.
     */
    static createV1<Data, Code extends number, Alg extends number>(code: Code, digest: API.MultihashDigest<Alg>): CID<Data, Code, Alg, 1>;
    /**
     * Decoded a CID from its binary representation. The byte array must contain
     * only the CID with no additional bytes.
     *
     * An error will be thrown if the bytes provided do not contain a valid
     * binary representation of a CID.
     */
    static decode<Data, Code extends number, Alg extends number, Version extends API.Version>(bytes: API.ByteView<API.Link<Data, Code, Alg, Version>>): CID<Data, Code, Alg, Version>;
    /**
     * Decoded a CID from its binary representation at the beginning of a byte
     * array.
     *
     * Returns an array with the first element containing the CID and the second
     * element containing the remainder of the original byte array. The remainder
     * will be a zero-length byte array if the provided bytes only contained a
     * binary CID representation.
     */
    static decodeFirst<T, C extends number, A extends number, V extends API.Version>(bytes: API.ByteView<API.Link<T, C, A, V>>): [CID<T, C, A, V>, Uint8Array];
    /**
     * Inspect the initial bytes of a CID to determine its properties.
     *
     * Involves decoding up to 4 varints. Typically this will require only 4 to 6
     * bytes but for larger multicodec code values and larger multihash digest
     * lengths these varints can be quite large. It is recommended that at least
     * 10 bytes be made available in the `initialBytes` argument for a complete
     * inspection.
     */
    static inspectBytes<T, C extends number, A extends number, V extends API.Version>(initialBytes: API.ByteView<API.Link<T, C, A, V>>): {
        version: V;
        codec: C;
        multihashCode: A;
        digestSize: number;
        multihashSize: number;
        size: number;
    };
    /**
     * Takes cid in a string representation and creates an instance. If `base`
     * decoder is not provided will use a default from the configuration. It will
     * throw an error if encoding of the CID is not compatible with supplied (or
     * a default decoder).
     */
    static parse<Prefix extends string, Data, Code extends number, Alg extends number, Version extends API.Version>(source: API.ToString<API.Link<Data, Code, Alg, Version>, Prefix>, base?: API.MultibaseDecoder<Prefix>): CID<Data, Code, Alg, Version>;
}
declare const DAG_PB_CODE = 112;
declare const SHA_256_CODE = 18;
//# sourceMappingURL=cid.d.ts.map