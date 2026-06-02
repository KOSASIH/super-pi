"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uninstallModules = uninstallModules;
const account_abstraction_1 = require("viem/account-abstraction");
const utils_1 = require("viem/utils");
const utils_2 = require("viem/utils");
const index_js_1 = require("../../errors/index.js");
const encodeUninstallModule_js_1 = require("../../utils/encodeUninstallModule.js");
async function uninstallModules(client, parameters) {
    const { account: account_ = client.account, maxFeePerGas, maxPriorityFeePerGas, nonce, modules, calls, paymaster, paymasterContext } = parameters;
    if (!account_) {
        throw new index_js_1.AccountNotFoundError({
            docsPath: "/docs/actions/wallet/sendTransaction"
        });
    }
    const account = (0, utils_2.parseAccount)(account_);
    return (0, utils_1.getAction)(client, account_abstraction_1.sendUserOperation, "sendUserOperation")({
        calls: [
            ...(0, encodeUninstallModule_js_1.encodeUninstallModule)({
                account,
                modules
            }),
            ...(calls ?? [])
        ],
        paymaster,
        paymasterContext,
        maxFeePerGas,
        maxPriorityFeePerGas,
        nonce,
        account
    });
}
//# sourceMappingURL=uninstallModules.js.map