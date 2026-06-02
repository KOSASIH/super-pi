"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installModules = installModules;
const account_abstraction_1 = require("viem/account-abstraction");
const utils_1 = require("viem/utils");
const index_js_1 = require("../../errors/index.js");
const encodeInstallModule_js_1 = require("../../utils/encodeInstallModule.js");
async function installModules(client, parameters) {
    const { account: account_ = client.account, maxFeePerGas, maxPriorityFeePerGas, nonce, modules, paymaster, paymasterContext, authorization, calls } = parameters;
    if (!account_) {
        throw new index_js_1.AccountNotFoundError({
            docsPath: "/docs/actions/wallet/sendTransaction"
        });
    }
    const account = (0, utils_1.parseAccount)(account_);
    return (0, utils_1.getAction)(client, account_abstraction_1.sendUserOperation, "sendUserOperation")({
        calls: [
            ...(0, encodeInstallModule_js_1.encodeInstallModule)({
                account,
                modules
            }),
            ...(calls ?? [])
        ],
        paymaster,
        paymasterContext,
        maxFeePerGas,
        maxPriorityFeePerGas,
        authorization,
        nonce,
        account: account
    });
}
//# sourceMappingURL=installModules.js.map