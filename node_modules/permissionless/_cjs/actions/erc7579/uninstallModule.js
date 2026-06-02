"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uninstallModule = uninstallModule;
const account_abstraction_1 = require("viem/account-abstraction");
const utils_1 = require("viem/utils");
const utils_2 = require("viem/utils");
const index_js_1 = require("../../errors/index.js");
const encodeUninstallModule_js_1 = require("../../utils/encodeUninstallModule.js");
async function uninstallModule(client, parameters) {
    const { account: account_ = client.account, maxFeePerGas, maxPriorityFeePerGas, nonce, address, context, deInitData, type, calls, paymaster, paymasterContext } = parameters;
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
                modules: [{ type, address, context: context ?? deInitData }]
            }),
            ...(calls ?? [])
        ],
        paymaster,
        paymasterContext,
        maxFeePerGas,
        maxPriorityFeePerGas,
        nonce,
        account: account
    });
}
//# sourceMappingURL=uninstallModule.js.map