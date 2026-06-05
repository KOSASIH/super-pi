import type { Address, Chain, Client, Hex, OneOf, Transport } from "viem";
import { type GetSmartAccountParameter, type PaymasterActions, type SmartAccount } from "viem/account-abstraction";
import type { ModuleType } from "./supportsModule.js";
export type UninstallModuleParameters<TSmartAccount extends SmartAccount | undefined> = GetSmartAccountParameter<TSmartAccount> & {
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
    deInitData: Hex;
} | {
    context: Hex;
}>;
export declare function uninstallModule<TSmartAccount extends SmartAccount | undefined>(client: Client<Transport, Chain | undefined, TSmartAccount>, parameters: UninstallModuleParameters<TSmartAccount>): Promise<Hex>;
//# sourceMappingURL=uninstallModule.d.ts.map