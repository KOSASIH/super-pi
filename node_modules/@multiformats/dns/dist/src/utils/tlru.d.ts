/**
 * Time Aware Least Recent Used Cache
 *
 * @see https://arxiv.org/pdf/1801.00390
 */
export declare class TLRU<T> {
    private readonly lru;
    constructor(maxSize: number);
    get(key: string): T | undefined;
    set(key: string, value: T, ttl: number): void;
    has(key: string): boolean;
    remove(key: string): void;
    clear(): void;
}
//# sourceMappingURL=tlru.d.ts.map