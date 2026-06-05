import type { Address, Chain, Client, Hex, Transport } from "viem";
import { type PaymasterActions, type SmartAccount } from "viem/account-abstraction";
import { type EncodeUninstallModuleParameters } from "../../utils/encodeUninstallModule.js";
export type UninstallModulesParameters<TSmartAccount extends SmartAccount | undefined> = EncodeUninstallModuleParameters<TSmartAccount> & {
    maxFeePerGas?: bigint;
    maxPriorityFeePerGas?: bigint;
    nonce?: bigint;
    calls?: readonly {
        to: Address;
        value?: bigint | undefined;
        data?: Hex | undefined;
    }[];
    paymaster?: Address | true | {
        /** Retrieves paymaster-related User Operation properties to be used for sending the User Operation. */
        getPaymasterData?: PaymasterActions["getPaymasterData"] | undefined;
        /** Retrieves paymaster-related User Operation properties to be used for gas estimation. */
        getPaymasterStubData?: PaymasterActions["getPaymasterStubData"] | undefined;
    } | undefined;
    /** Paymaster context to pass to `getPaymasterData` and `getPaymasterStubData` calls. */
    paymasterContext?: unknown | undefined;
};
export declare function uninstallModules<TSmartAccount extends SmartAccount | undefined>(client: Client<Transport, Chain | undefined, TSmartAccount>, parameters: UninstallModulesParameters<TSmartAccount>): Promise<Hex>;
//# sourceMappingURL=uninstallModules.d.ts.map