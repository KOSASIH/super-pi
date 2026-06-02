import { RecordType } from '../index.js';
import type { Answer, DNSResponse } from '../index.js';
export interface AnswerCache {
    get(fqdn: string, types: RecordType[]): DNSResponse | undefined;
    add(domain: string, answer: Answer): void;
    remove(domain: string, type: ResponseType): void;
    clear(): void;
}
/**
 * Avoid sending multiple queries for the same hostname by caching results
 */
export declare function cache(size: number): AnswerCache;
//# sourceMappingURL=cache.d.ts.map