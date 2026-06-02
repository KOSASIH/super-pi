import { sendUserOperation } from "viem/account-abstraction";
import { getAction, parseAccount } from "viem/utils";
import { AccountNotFoundError } from "../../errors/index.js";
import { encodeInstallModule } from "../../utils/encodeInstallModule.js";
export function installModule(client, parameters) {
    const { account: account_ = client.account, maxFeePerGas, maxPriorityFeePerGas, nonce, address, context, initData, type, calls, paymaster, authorization, paymasterContext } = parameters;
    if (!account_) {
        throw new AccountNotFoundError({
            docsPath: "/docs/actions/wallet/sendTransaction"
        });
    }
    const account = parseAccount(account_);
    return getAction(client, sendUserOperation, "sendUserOperation")({
        calls: [
            ...encodeInstallModule({
                account,
                modules: [{ address, context: context ?? initData, type }]
            }),
            ...(calls ?? [])
        ],
        paymaster,
        paymasterContext,
        maxFeePerGas,
        maxPriorityFeePerGas,
        nonce,
        authorization,
        account
    });
}
//# sourceMappingURL=installModule.js.map