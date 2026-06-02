import { sendUserOperation } from "viem/account-abstraction";
import { getAction, parseAccount } from "viem/utils";
import { AccountNotFoundError } from "../../errors/index.js";
import { encodeInstallModule } from "../../utils/encodeInstallModule.js";
export async function installModules(client, parameters) {
    const { account: account_ = client.account, maxFeePerGas, maxPriorityFeePerGas, nonce, modules, paymaster, paymasterContext, authorization, calls } = parameters;
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