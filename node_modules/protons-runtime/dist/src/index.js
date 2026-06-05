/**
 * @packageDocumentation
 *
 * This module contains serialization/deserialization code used when encoding/decoding protobufs.
 *
 * It should be declared as a dependency of your project:
 *
 * ```console
 * npm i protons-runtime
 * ```
 */
export { decodeMessage } from './decode.js';
export { encodeMessage } from './encode.js';
export { enumeration } from './codecs/enum.js';
export { message } from './codecs/message.js';
export { createReader as reader } from './utils/reader.js';
export { createWriter as writer } from './utils/writer.js';
/**
 * This will be removed in a future release
 *
 * @deprecated
 */
export class CodeError extends Error {
    code;
    constructor(message, code) {
        super(message);
        this.code = code;
    }
}
/**
 * Thrown when a repeated field has too many elements
 */
export class MaxLengthError extends Error {
    /**
     * This will be removed in a future release
     *
     * @deprecated use the `.name` property instead
     */
    code = 'ERR_MAX_LENGTH';
    name = 'MaxLengthError';
}
/**
 * Thrown when a map has too many elements
 */
export class MaxSizeError extends Error {
    /**
     * This will be removed in a future release
     *
     * @deprecated use the `.name` property instead
     */
    code = 'ERR_MAX_SIZE';
    name = 'MaxSizeError';
}
export class ParseError extends Error {
    /**
     * This will be removed in a future release
     *
     * @deprecated use the `.name` property instead
     */
    code = 'ERR_PARSE_ERROR';
    name = 'ParseError';
}
export class NoMessagesFoundError extends Error {
    /**
     * This will be removed in a future release
     *
     * @deprecated use the `.name` property instead
     */
    code = 'ERR_NO_MESSAGES_FOUND';
    name = 'NoMessagesFoundError';
}
//# sourceMappingURL=index.js.map