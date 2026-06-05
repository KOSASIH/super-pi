import { createCodec, CODEC_TYPES } from '../codec.js';
export function message(encode, decode) {
    return createCodec('message', CODEC_TYPES.LENGTH_DELIMITED, encode, decode);
}
//# sourceMappingURL=message.js.map