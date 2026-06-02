import { sendUserOperation } from "viem/account-abstraction";
import { getAction } from "viem/utils";
import { parseAccount } from "viem/utils";
import { AccountNotFoundError } from "../../errors/index.js";
import { encodeUninstallModule } from "../../utils/encodeUninstallModule.js";
export async function uninstallModules(client, parameters) {
    const { account: account_ = client.account, maxFeePerGas, maxPriorityFeePerGas, nonce, modules, calls, paymaster, paymasterContext } = parameters;
    if (!account_) {
        throw new AccountNotFoundError({
            docsPath: "/docs/actions/wallet/sendTransaction"
        });
    }
    const account = parseAccount(account_);
    return getAction(client, sendUserOperation, "sendUserOperation")({
        calls: [
            ...encodeUninstallModule({
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