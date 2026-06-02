"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toEcdsaKernelSmartAccount = toEcdsaKernelSmartAccount;
const toKernelSmartAccount_js_1 = require("./toKernelSmartAccount.js");
async function toEcdsaKernelSmartAccount(parameters) {
    return (0, toKernelSmartAccount_js_1.toKernelSmartAccount)({
        ...parameters,
        validatorAddress: parameters.validatorAddress ?? parameters.ecdsaValidatorAddress
    });
}
//# sourceMappingURL=toEcdsaKernelSmartAccount.js.map