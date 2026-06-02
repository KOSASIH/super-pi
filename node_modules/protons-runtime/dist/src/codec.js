// https://developers.google.com/protocol-buffers/docs/encoding#structure
export var CODEC_TYPES;
(function (CODEC_TYPES) {
    CODEC_TYPES[CODEC_TYPES["VARINT"] = 0] = "VARINT";
    CODEC_TYPES[CODEC_TYPES["BIT64"] = 1] = "BIT64";
    CODEC_TYPES[CODEC_TYPES["LENGTH_DELIMITED"] = 2] = "LENGTH_DELIMITED";
    CODEC_TYPES[CODEC_TYPES["START_GROUP"] = 3] = "START_GROUP";
    CODEC_TYPES[CODEC_TYPES["END_GROUP"] = 4] = "END_GROUP";
    CODEC_TYPES[CODEC_TYPES["BIT32"] = 5] = "BIT32";
})(CODEC_TYPES || (CODEC_TYPES = {}));
export function createCodec(name, type, encode, decode) {
    return {
        name,
        type,
        encode,
        decode
    };
}
//# sourceMappingURL=codec.js.map