export function encodingLength(input: string | Uint8Array): number;

type WithBytes<T> = T & {
  bytes: number
};
export const encode: WithBytes<<T extends Uint8Array = Uint8Array> (str: string, arr?: T, start?: number) => T>;
export const decode: WithBytes<(buf: Uint8Array, start?: number, end?: number) => string>;
export const name: 'utf8';
export {};
