/* global crypto */
import { from } from './hasher.js';
const sha = (name) => async (data) => new Uint8Array(await crypto.subtle.digest(name, data));
export const sha1 = from({
    name: 'sha-1',
    code: 0x11,
    encode: sha('SHA-1')
});
//# sourceMappingURL=sha1-browser.js.map