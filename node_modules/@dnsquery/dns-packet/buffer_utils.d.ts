export function isU8Arr (input: any): input is Uint8Array
export function bytelength (input: string | Uint8Array): number
export function from (input: Uint8Array | Array | string): Uint8Array
export function write (arr: Uint8Array, str: string, start: number): number
export function toHex (buf: Uint8Array, start?: number, end?: number): string
export function hexLength (str: string): number
export function writeHex (buf: Uint8Array, str: string, start: number, end: number): Uint8Array
export function readUInt32BE (buf: Uint8Array, offset: number): number
export function readUInt16BE (buf: Uint8Array, offset: number): number
export function writeUInt32BE (buf: Uint8Array, value: number, offset: number): number
export function writeUInt16BE (buf: Uint8Array, value: number, offset: number): number
export function copy (source: Uint8Array, target: Uint8Array, targetStart?: number, sourceStart?: number, sourceEnd?: number): number
