import { createCodec, CODEC_TYPES } from '../codec.js';
export function enumeration(v) {
    function findValue(val) {
        // Use the reverse mapping to look up the enum key for the stored value
        // https://www.typescriptlang.org/docs/handbook/enums.html#reverse-mappings
        if (v[val.toString()] == null) {
            throw new Error('Invalid enum value');
        }
        return v[val];
    }
    const encode = function enumEncode(val, writer) {
        const enumValue = findValue(val);
        writer.int32(enumValue);
    };
    const decode = function enumDecode(reader) {
        const val = reader.int32();
        return findValue(val);
    };
    // @ts-expect-error yeah yeah
    return createCodec('enum', CODEC_TYPES.VARINT, encode, decode);
}
//# sourceMappingURL=enum.js.map