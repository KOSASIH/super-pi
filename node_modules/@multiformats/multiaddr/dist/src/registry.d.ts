import type { Registry as RegistryInterface } from './index.ts';
export declare const V = -1;
export interface ProtocolCodec {
    /**
     * A numeric code that will be used in the binary representation of the tuple.
     */
    code: number;
    /**
     * A string name that will be used in the string representation of the addr.
     */
    name: string;
    /**
     * Size defines the expected length of the address part of the tuple - valid
     * values are `-1` (or the `V` constant) for variable length (this will be
     * varint encoded in the binary representation), `0` for no address part or a
     * number that represents a fixed-length address.
     */
    size?: number;
    /**
     * If this protocol is a path protocol.
     *
     * @deprecated This will be removed in a future release
     */
    path?: boolean;
    /**
     * If this protocol can be resolved using configured resolvers.
     *
     * @deprecated This will be removed in a future release
     */
    resolvable?: boolean;
    /**
     * If specified this protocol codec will also be used to decode tuples with
     * these names from string multiaddrs.
     */
    aliases?: string[];
    /**
     * Where the multiaddr has been encoded as a string, decode the value if
     * necessary, unescaping any escaped values
     */
    stringToValue?(value: string): string;
    /**
     * To encode the multiaddr as a string, escape any necessary values
     */
    valueToString?(value: string): string;
    /**
     * To encode the multiaddr as bytes, convert the value to bytes
     */
    valueToBytes?(value: string): Uint8Array;
    /**
     * To decode bytes to a multiaddr, convert the value bytes to a string
     */
    bytesToValue?(bytes: Uint8Array): string;
    /**
     * Perform any necessary validation on the string value
     */
    validate?(value: string): void;
}
declare class Registry implements RegistryInterface {
    private protocolsByCode;
    private protocolsByName;
    getProtocol(key: string | number): ProtocolCodec;
    addProtocol(codec: ProtocolCodec): void;
    removeProtocol(code: number): void;
}
export declare const registry: Registry;
export {};
//# sourceMappingURL=registry.d.ts.map