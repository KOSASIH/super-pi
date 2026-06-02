import type { Address, Client, Hex, OneOf, SignedAuthorization } from "viem";
import { type GetSmartAccountParameter, type PaymasterActions, type SmartAccount } from "viem/account-abstraction";
import type { ModuleType } from "./supportsModule.js";
export type InstallModuleParameters<TSmartAccount extends SmartAccount | undefined> = GetSmartAccountParameter<TSmartAccount> & {
    authorization?: SignedAuthorization<number> | undefined;
    type: ModuleType;
    address: Address;
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
} & OneOf<{
    context: Hex;
} | {
    initData: Hex;
}>;
export declare function installModule<TSmartAccount extends SmartAccount | undefined>(client: Client, parameters: InstallModuleParameters<TSmartAccount>): Promise<Hex>;
//# sourceMappingURL=installModule.d.ts.map