import { pushable } from 'it-pushable';
import merge from 'it-merge';
export function pipe(first, ...rest) {
    if (first == null) {
        throw new Error('Empty pipeline');
    }
    // Duplex at start: wrap in function and return duplex source
    if (isDuplex(first)) {
        const duplex = first;
        first = () => duplex.source;
        // Iterable at start: wrap in function
    }
    else if (isIterable(first) || isAsyncIterable(first)) {
        const source = first;
        first = () => source;
    }
    const fns = [first, ...rest];
    if (fns.length > 1) {
        // Duplex at end: use duplex sink
        if (isDuplex(fns[fns.length - 1])) {
            fns[fns.length - 1] = fns[fns.length - 1].sink;
        }
    }
    if (fns.length > 2) {
        // Duplex in the middle, consume source with duplex sink and return duplex source
        for (let i = 1; i < fns.length - 1; i++) {
            if (isDuplex(fns[i])) {
                fns[i] = duplexPipelineFn(fns[i]);
            }
        }
    }
    return rawPipe(...fns);
}
export const rawPipe = (...fns) => {
    let res;
    while (fns.length > 0) {
        res = fns.shift()(res);
    }
    return res;
};
const isAsyncIterable = (obj) => {
    return obj?.[Symbol.asyncIterator] != null;
};
const isIterable = (obj) => {
    return obj?.[Symbol.iterator] != null;
};
const isDuplex = (obj) => {
    if (obj == null) {
        return false;
    }
    return obj.sink != null && obj.source != null;
};
const duplexPipelineFn = (duplex) => {
    return (source) => {
        const p = duplex.sink(source);
        if (p?.then != null) {
            const stream = pushable({
                objectMode: true
            });
            p.then(() => {
                stream.end();
            }, (err) => {
                stream.end(err);
            });
            let sourceWrap;
            const source = duplex.source;
            if (isAsyncIterable(source)) {
                sourceWrap = async function* () {
                    yield* source;
                    stream.end();
                };
            }
            else if (isIterable(source)) {
                sourceWrap = function* () {
                    yield* source;
                    stream.end();
                };
            }
            else {
                throw new Error('Unknown duplex source type - must be Iterable or AsyncIterable');
            }
            return merge(stream, sourceWrap());
        }
        return duplex.source;
    };
};
//# sourceMappingURL=index.js.map