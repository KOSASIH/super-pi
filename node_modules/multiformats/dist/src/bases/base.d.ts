import type { BaseCodec, BaseDecoder, BaseEncoder, CombobaseDecoder, Multibase, MultibaseCodec, MultibaseDecoder, MultibaseEncoder, UnibaseDecoder } from './interface.js';
interface EncodeFn {
    (bytes: Uint8Array): string;
}
interface DecodeFn {
    (text: string): Uint8Array;
}
/**
 * Class represents both BaseEncoder and MultibaseEncoder meaning it
 * can be used to encode to multibase or base encode without multibase
 * prefix.
 */
declare class Encoder<Base extends string, Prefix extends string> implements MultibaseEncoder<Prefix>, BaseEncoder {
    readonly name: Base;
    readonly prefix: Prefix;
    readonly baseEncode: EncodeFn;
    constructor(name: Base, prefix: Prefix, baseEncode: EncodeFn);
    encode(bytes: Uint8Array): Multibase<Prefix>;
}
/**
 * Class represents both BaseDecoder and MultibaseDecoder so it could be used
 * to decode multibases (with matching prefix) or just base decode strings
 * with corresponding base encoding.
 */
declare class Decoder<Base extends string, Prefix extends string> implements MultibaseDecoder<Prefix>, UnibaseDecoder<Prefix>, BaseDecoder {
    readonly name: Base;
    readonly prefix: Prefix;
    readonly baseDecode: DecodeFn;
    private readonly prefixCodePoint;
    constructor(name: Base, prefix: Prefix, baseDecode: DecodeFn);
    decode(text: string): Uint8Array;
    or<OtherPrefix extends string>(decoder: UnibaseDecoder<OtherPrefix> | ComposedDecoder<OtherPrefix>): ComposedDecoder<Prefix | OtherPrefix>;
}
type Decoders<Prefix extends string> = Record<Prefix, UnibaseDecoder<Prefix>>;
declare class ComposedDecoder<Prefix extends string> implements MultibaseDecoder<Prefix>, CombobaseDecoder<Prefix> {
    readonly decoders: Decoders<Prefix>;
    constructor(decoders: Decoders<Prefix>);
    or<OtherPrefix extends string>(decoder: UnibaseDecoder<OtherPrefix> | ComposedDecoder<OtherPrefix>): ComposedDecoder<Prefix | OtherPrefix>;
    decode(input: string): Uint8Array;
}
export declare function or<L extends string, R extends string>(left: UnibaseDecoder<L> | CombobaseDecoder<L>, right: UnibaseDecoder<R> | CombobaseDecoder<R>): ComposedDecoder<L | R>;
export declare class Codec<Base extends string, Prefix extends string> implements MultibaseCodec<Prefix>, MultibaseEncoder<Prefix>, MultibaseDecoder<Prefix>, BaseCodec, BaseEncoder, BaseDecoder {
    readonly name: Base;
    readonly prefix: Prefix;
    readonly baseEncode: EncodeFn;
    readonly baseDecode: DecodeFn;
    readonly encoder: Encoder<Base, Prefix>;
    readonly decoder: Decoder<Base, Prefix>;
    constructor(name: Base, prefix: Prefix, baseEncode: EncodeFn, baseDecode: DecodeFn);
    encode(input: Uint8Array): string;
    decode(input: string): Uint8Array;
}
export declare function from<Base extends string, Prefix extends string>({ name, prefix, encode, decode }: {
    name: Base;
    prefix: Prefix;
    encode: EncodeFn;
    decode: DecodeFn;
}): Codec<Base, Prefix>;
export declare function baseX<Base extends string, Prefix extends string>({ name, prefix, alphabet }: {
    name: Base;
    prefix: Prefix;
    alphabet: string;
}): Codec<Base, Prefix>;
/**
 * RFC4648 Factory
 */
export declare function rfc4648<Base extends string, Prefix extends string>({ name, prefix, bitsPerChar, alphabet }: {
    name: Base;
    prefix: Prefix;
    bitsPerChar: number;
    alphabet: string;
}): Codec<Base, Prefix>;
export {};
//# sourceMappingURL=base.d.ts.map