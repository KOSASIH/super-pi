"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.to7702SimpleSmartAccount = to7702SimpleSmartAccount;
const toSimpleSmartAccount_js_1 = require("./toSimpleSmartAccount.js");
async function to7702SimpleSmartAccount(parameters) {
    return (0, toSimpleSmartAccount_js_1.toSimpleSmartAccount)({
        ...parameters,
        eip7702: true
    });
}
//# sourceMappingURL=to7702SimpleSmartAccount.js.map