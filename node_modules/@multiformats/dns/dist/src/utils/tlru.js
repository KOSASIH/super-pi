import hashlru from 'hashlru';
/**
 * Time Aware Least Recent Used Cache
 *
 * @see https://arxiv.org/pdf/1801.00390
 */
export class TLRU {
    lru;
    constructor(maxSize) {
        // @ts-expect-error types are broken - https://github.com/dominictarr/hashlru/pull/24
        this.lru = hashlru(maxSize);
    }
    get(key) {
        const value = this.lru.get(key);
        if (value != null) {
            if (value.expire != null && value.expire < Date.now()) {
                this.lru.remove(key);
                return undefined;
            }
            return value.value;
        }
        return undefined;
    }
    set(key, value, ttl) {
        this.lru.set(key, { value, expire: Date.now() + ttl });
    }
    has(key) {
        const value = this.get(key);
        if (value != null) {
            return true;
        }
        return false;
    }
    remove(key) {
        this.lru.remove(key);
    }
    clear() {
        this.lru.clear();
    }
}
//# sourceMappingURL=tlru.js.map