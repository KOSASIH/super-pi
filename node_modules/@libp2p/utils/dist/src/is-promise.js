export function isPromise(thing) {
    if (thing == null) {
        return false;
    }
    return typeof thing.then === 'function' &&
        typeof thing.catch === 'function' &&
        typeof thing.finally === 'function';
}
//# sourceMappingURL=is-promise.js.map