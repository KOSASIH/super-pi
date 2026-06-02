import { bytes as binary, CID } from './index.js';
function readonly({ enumerable = true, configurable = false } = {}) {
    return { enumerable, configurable, writable: false };
}
function* linksWithin(path, value) {
    if (value != null && typeof value === 'object') {
        if (Array.isArray(value)) {
            for (const [index, element] of value.entries()) {
                const elementPath = [...path, index];
                const cid = CID.asCID(element);
                if (cid != null) {
                    yield [elementPath.join('/'), cid];
                }
                else if (typeof element === 'object') {
                    yield* links(element, elementPath);
                }
            }
        }
        else {
            const cid = CID.asCID(value);
            if (cid != null) {
                yield [path.join('/'), cid];
            }
            else {
                yield* links(value, path);
            }
        }
    }
}
function* links(source, base) {
    if (source == null || source instanceof Uint8Array) {
        return;
    }
    const cid = CID.asCID(source);
    if (cid != null) {
        yield [base.join('/'), cid];
    }
    for (const [key, value] of Object.entries(source)) {
        const path = [...base, key];
        yield* linksWithin(path, value);
    }
}
function* treeWithin(path, value) {
    if (Array.isArray(value)) {
        for (const [index, element] of value.entries()) {
            const elementPath = [...path, index];
            yield elementPath.join('/');
            if (typeof element === 'object' && (CID.asCID(element) == null)) {
                yield* tree(element, elementPath);
            }
        }
    }
    else {
        yield* tree(value, path);
    }
}
function* tree(source, base) {
    if (source == null || typeof source !== 'object') {
        return;
    }
    for (const [key, value] of Object.entries(source)) {
        const path = [...base, key];
        yield path.join('/');
        if (value != null && !(value instanceof Uint8Array) && typeof value === 'object' && (CID.asCID(value) == null)) {
            yield* treeWithin(path, value);
        }
    }
}
function get(source, path) {
    let node = source;
    for (const [index, key] of path.entries()) {
        node = node[key];
        if (node == null) {
            throw new Error(`Object has no property at ${path.slice(0, index + 1).map(part => `[${JSON.stringify(part)}]`).join('')}`);
        }
        const cid = CID.asCID(node);
        if (cid != null) {
            return { value: cid, remaining: path.slice(index + 1).join('/') };
        }
    }
    return { value: node };
}
/**
 * @template T - Logical type of the data encoded in the block
 * @template C - multicodec code corresponding to codec used to encode the block
 * @template A - multicodec code corresponding to the hashing algorithm used in CID creation.
 * @template V - CID version
 */
export class Block {
    cid;
    bytes;
    value;
    asBlock;
    constructor({ cid, bytes, value }) {
        if (cid == null || bytes == null || typeof value === 'undefined') {
            throw new Error('Missing required argument');
        }
        this.cid = cid;
        this.bytes = bytes;
        this.value = value;
        this.asBlock = this;
        // Mark all the properties immutable
        Object.defineProperties(this, {
            cid: readonly(),
            bytes: readonly(),
            value: readonly(),
            asBlock: readonly()
        });
    }
    links() {
        return links(this.value, []);
    }
    tree() {
        return tree(this.value, []);
    }
    get(path = '/') {
        return get(this.value, path.split('/').filter(Boolean));
    }
}
/**
 * @template T - Logical type of the data encoded in the block
 * @template Code - multicodec code corresponding to codec used to encode the block
 * @template Alg - multicodec code corresponding to the hashing algorithm used in CID creation.
 */
export async function encode({ value, codec, hasher }) {
    if (typeof value === 'undefined') {
        throw new Error('Missing required argument "value"');
    }
    if (codec == null || hasher == null) {
        throw new Error('Missing required argument: codec or hasher');
    }
    const bytes = codec.encode(value);
    const hash = await hasher.digest(bytes);
    const cid = CID.create(1, codec.code, hash);
    return new Block({ value, bytes, cid });
}
/**
 * @template T - Logical type of the data encoded in the block
 * @template Code - multicodec code corresponding to codec used to encode the block
 * @template Alg - multicodec code corresponding to the hashing algorithm used in CID creation.
 */
export async function decode({ bytes, codec, hasher }) {
    if (bytes == null) {
        throw new Error('Missing required argument "bytes"');
    }
    if (codec == null || hasher == null) {
        throw new Error('Missing required argument: codec or hasher');
    }
    const value = codec.decode(bytes);
    const hash = await hasher.digest(bytes);
    const cid = CID.create(1, codec.code, hash);
    return new Block({ value, bytes, cid });
}
/**
 * @template T - Logical type of the data encoded in the block
 * @template Code - multicodec code corresponding to codec used to encode the block
 * @template Alg - multicodec code corresponding to the hashing algorithm used in CID creation.
 * @template V - CID version
 */
export function createUnsafe({ bytes, cid, value: maybeValue, codec }) {
    const value = maybeValue !== undefined
        ? maybeValue
        : (codec?.decode(bytes));
    if (value === undefined) {
        throw new Error('Missing required argument, must either provide "value" or "codec"');
    }
    return new Block({
        cid: cid,
        bytes,
        value
    });
}
/**
 * @template T - Logical type of the data encoded in the block
 * @template Code - multicodec code corresponding to codec used to encode the block
 * @template Alg - multicodec code corresponding to the hashing algorithm used in CID creation.
 * @template V - CID version
 */
export async function create({ bytes, cid, hasher, codec }) {
    if (bytes == null) {
        throw new Error('Missing required argument "bytes"');
    }
    if (hasher == null) {
        throw new Error('Missing required argument "hasher"');
    }
    const value = codec.decode(bytes);
    const hash = await hasher.digest(bytes);
    if (!binary.equals(cid.multihash.bytes, hash.bytes)) {
        throw new Error('CID hash does not match bytes');
    }
    return createUnsafe({
        bytes,
        cid,
        value,
        codec
    });
}
//# sourceMappingURL=block.js.map