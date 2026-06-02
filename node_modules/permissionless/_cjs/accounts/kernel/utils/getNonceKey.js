"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNonceKeyWithEncoding = void 0;
const viem_1 = require("viem");
const constants_js_1 = require("../constants.js");
const isKernelV2_js_1 = require("./isKernelV2.js");
const getNonceKeyWithEncoding = (kernelVersion, validatorAddress, nonceKey = 0n) => {
    if ((0, isKernelV2_js_1.isKernelV2)(kernelVersion)) {
        return nonceKey;
    }
    if (nonceKey > viem_1.maxUint16)
        throw new Error(`nonce key must be equal or less than 2 bytes(maxUint16) for Kernel version ${kernelVersion}`);
    const validatorMode = constants_js_1.VALIDATOR_MODE.DEFAULT;
    const validatorType = constants_js_1.VALIDATOR_TYPE.ROOT;
    const encoding = (0, viem_1.pad)((0, viem_1.concatHex)([
        validatorMode,
        validatorType,
        validatorAddress,
        (0, viem_1.toHex)(nonceKey, { size: 2 })
    ]), { size: 24 });
    return BigInt(encoding);
};
exports.getNonceKeyWithEncoding = getNonceKeyWithEncoding;
//# sourceMappingURL=getNonceKey.js.map