import type { Address, Chain, Client, Hex, SignedAuthorization, Transport } from "viem";
import { type PaymasterActions, type SmartAccount } from "viem/account-abstraction";
import { type EncodeInstallModuleParameters } from "../../utils/encodeInstallModule.js";
export type InstallModulesParameters<TSmartAccount extends SmartAccount | undefined> = EncodeInstallModuleParameters<TSmartAccount> & {
    authorization?: SignedAuthorization<number> | undefined;
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
export declare function installModules<TSmartAccount extends SmartAccount | undefined>(client: Client<Transport, Chain | undefined, TSmartAccount>, parameters: InstallModulesParameters<TSmartAccount>): Promise<Hex>;
//# sourceMappingURL=installModules.d.ts.map