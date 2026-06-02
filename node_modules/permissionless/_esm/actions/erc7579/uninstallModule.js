import { sendUserOperation } from "viem/account-abstraction";
import { getAction } from "viem/utils";
import { parseAccount } from "viem/utils";
import { AccountNotFoundError } from "../../errors/index.js";
import { encodeUninstallModule } from "../../utils/encodeUninstallModule.js";
export async function uninstallModule(client, parameters) {
    const { account: account_ = client.account, maxFeePerGas, maxPriorityFeePerGas, nonce, address, context, deInitData, type, calls, paymaster, paymasterContext } = parameters;
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