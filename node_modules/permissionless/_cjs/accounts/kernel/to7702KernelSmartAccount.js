"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.to7702KernelSmartAccount = to7702KernelSmartAccount;
const toKernelSmartAccount_js_1 = require("./toKernelSmartAccount.js");
async function to7702KernelSmartAccount(parameters) {
    return (0, toKernelSmartAccount_js_1.toKernelSmartAccount)({
        ...parameters,
        eip7702: true
    });
}
//# sourceMappingURL=to7702KernelSmartAccount.js.map