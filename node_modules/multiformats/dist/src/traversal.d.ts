import type { BlockView as _BlockView } from './block/interface.js';
import type { CID, Version } from './cid.js';
type BlockView<T = unknown, C extends number = number, A extends number = number, V extends Version = Version> = _BlockView<T, C, A, V>;
export declare function walk({ cid, load, seen }: {
    cid: CID;
    load(cid: CID): Promise<BlockView | null>;
    seen?: Set<string>;
}): Promise<void>;
export {};
//# sourceMappingURL=traversal.d.ts.map