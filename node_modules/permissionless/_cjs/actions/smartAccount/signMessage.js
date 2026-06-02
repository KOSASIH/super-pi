"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signMessage = signMessage;
const utils_1 = require("viem/utils");
const index_js_1 = require("../../errors/index.js");
async function signMessage(client, { account: account_ = client.account, message }) {
    if (!account_)
        throw new index_js_1.AccountNotFoundError({
            docsPath: "/docs/actions/wallet/signMessage"
        });
    const account = (0, utils_1.parseAccount)(account_);
    return account.signMessage({ message });
}
//# sourceMappingURL=signMessage.js.map