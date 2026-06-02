import { type Chain, type Client, type Transport } from "viem";
import { type PrepareUserOperationParameters, type PrepareUserOperationRequest, type PrepareUserOperationReturnType, type SmartAccount } from "viem/account-abstraction";
export declare const prepareUserOperationForErc20Paymaster: (pimlicoClient: Client, { balanceOverride, balanceSlot: _balanceSlot }?: {
    balanceOverride?: boolean;
    balanceSlot?: bigint;
}) => <account extends SmartAccount | undefined, const calls extends readonly unknown[], const request extends PrepareUserOperationRequest<account, accountOverride, calls>, accountOverride extends SmartAccount | undefined = undefined>(client: Client<Transport, Chain | undefined, account>, parameters_: PrepareUserOperationParameters<account, accountOverride, calls, request>) => Promise<PrepareUserOperationReturnType<account, accountOverride, calls, request>>;
//# sourceMappingURL=prepareUserOperationForErc20Paymaster.d.ts.map