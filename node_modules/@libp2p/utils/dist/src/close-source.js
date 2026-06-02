import { getIterator } from 'get-iterator';
import { isPromise } from './is-promise.js';
export function closeSource(source, log) {
    const res = getIterator(source).return?.();
    if (isPromise(res)) {
        res.catch(err => {
            log.error('could not cause iterator to return', err);
        });
    }
}
//# sourceMappingURL=close-source.js.map