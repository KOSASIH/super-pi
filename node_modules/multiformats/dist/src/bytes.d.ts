export declare const empty: Uint8Array<ArrayBuffer>;
export declare function toHex(d: Uint8Array): string;
export declare function fromHex(hex: string): Uint8Array;
export declare function equals(aa: Uint8Array, bb: Uint8Array): boolean;
export declare function coerce(o: ArrayBufferView | ArrayBuffer | Uint8Array): Uint8Array;
export declare function isBinary(o: unknown): o is ArrayBuffer | ArrayBufferView;
export declare function fromString(str: string): Uint8Array;
export declare function toString(b: Uint8Array): string;
//# sourceMappingURL=bytes.d.ts.map