/**
 * Writes a 32 bit float to a buffer using little endian byte order
 */
export declare function writeFloatLE(val: number, buf: Uint8Array, pos: number): void;
/**
 * Writes a 32 bit float to a buffer using big endian byte order
 */
export declare function writeFloatBE(val: number, buf: Uint8Array, pos: number): void;
/**
 * Reads a 32 bit float from a buffer using little endian byte order
 */
export declare function readFloatLE(buf: Uint8Array, pos: number): number;
/**
 * Reads a 32 bit float from a buffer using big endian byte order
 */
export declare function readFloatBE(buf: Uint8Array, pos: number): number;
/**
 * Writes a 64 bit double to a buffer using little endian byte order
 */
export declare function writeDoubleLE(val: number, buf: Uint8Array, pos: number): void;
/**
 * Writes a 64 bit double to a buffer using big endian byte order
 */
export declare function writeDoubleBE(val: number, buf: Uint8Array, pos: number): void;
/**
 * Reads a 64 bit double from a buffer using little endian byte order
 */
export declare function readDoubleLE(buf: Uint8Array, pos: number): number;
/**
 * Reads a 64 bit double from a buffer using big endian byte order
 */
export declare function readDoubleBE(buf: Uint8Array, pos: number): number;
//# sourceMappingURL=float.d.ts.map