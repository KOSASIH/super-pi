"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNonceKeyWithEncoding = void 0;
const viem_1 = require("viem");
const constants_js_1 = require("../constants.js");
const getNonceKeyWithEncoding = (validatorAddress, nonceKey = 0n) => {
    const validatorMode = constants_js_1.VALIDATOR_MODE.DEFAULT;
    const validatorType = constants_js_1.VALIDATOR_TYPE.ROOT;
    const encoding = (0, viem_1.pad)((0, viem_1.concatHex)([
        validatorAddress,
        validatorMode,
        validatorType,
        (0, viem_1.toHex)(nonceKey, { size: 2 })
    ]), { size: 24 });
    const encodedNonceKey = BigInt(encoding);
    return encodedNonceKey;
};
exports.getNonceKeyWithEncoding = getNonceKeyWithEncoding;
//# sourceMappingURL=getNonceKey.js.map