"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signTypedData = signTypedData;
const viem_1 = require("viem");
const utils_1 = require("viem/utils");
const index_js_1 = require("../../errors/index.js");
async function signTypedData(client, { account: account_ = client.account, domain, message, primaryType, types: types_ }) {
    if (!account_) {
        throw new index_js_1.AccountNotFoundError({
            docsPath: "/docs/actions/wallet/signMessage"
        });
    }
    const account = (0, utils_1.parseAccount)(account_);
    const types = {
        EIP712Domain: (0, viem_1.getTypesForEIP712Domain)({ domain }),
        ...types_
    };
    (0, viem_1.validateTypedData)({
        domain,
        message,
        primaryType,
        types
    });
    return account.signTypedData({
        domain,
        primaryType,
        types,
        message
    });
}
//# sourceMappingURL=signTypedData.js.map