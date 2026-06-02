import type { MultiaddrInput, Multiaddr as MultiaddrInterface, MultiaddrObject, Protocol, Tuple, NodeAddress, ResolveOptions, Component } from './index.js';
declare const inspect: unique symbol;
export declare const symbol: unique symbol;
interface MultiaddrOptions {
    validate?: boolean;
}
/**
 * Creates a {@link Multiaddr} from a {@link MultiaddrInput}
 */
export declare class Multiaddr implements MultiaddrInterface {
    #private;
    [symbol]: boolean;
    constructor(addr?: MultiaddrInput | Component[], options?: MultiaddrOptions);
    get bytes(): Uint8Array;
    toString(): string;
    toJSON(): string;
    toOptions(): MultiaddrObject;
    getComponents(): Component[];
    protos(): Protocol[];
    protoCodes(): number[];
    protoNames(): string[];
    tuples(): Tuple[];
    stringTuples(): Array<[number, string?]>;
    encapsulate(addr: MultiaddrInput): MultiaddrInterface;
    decapsulate(addr: Multiaddr | string): MultiaddrInterface;
    decapsulateCode(code: number): Multiaddr;
    getPeerId(): string | null;
    getPath(): string | null;
    equals(addr: {
        bytes: Uint8Array;
    }): boolean;
    resolve(options?: ResolveOptions): Promise<MultiaddrInterface[]>;
    nodeAddress(): NodeAddress;
    isThinWaistAddress(): boolean;
    /**
     * Returns Multiaddr as a human-readable string
     * https://nodejs.org/api/util.html#utilinspectcustom
     *
     * @example
     * ```js
     * import { multiaddr } from '@multiformats/multiaddr'
     *
     * console.info(multiaddr('/ip4/127.0.0.1/tcp/4001'))
     * // 'Multiaddr(/ip4/127.0.0.1/tcp/4001)'
     * ```
     */
    [inspect](): string;
}
/**
 * Ensures all multiaddr tuples are correct. Throws if any invalid protocols or
 * values are encountered.
 */
export declare function validate(addr: Multiaddr): void;
export {};
//# sourceMappingURL=multiaddr.d.ts.map