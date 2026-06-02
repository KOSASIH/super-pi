import type { Account, Assign, Chain, OneOf, Prettify, Transport, WalletClient } from "viem";
import { type Address, type Client, type JsonRpcAccount, type LocalAccount } from "viem";
import { type SmartAccount, type SmartAccountImplementation, entryPoint07Abi } from "viem/account-abstraction";
import { type EthereumProvider } from "../../utils/toOwner.js";
export type ToNexusSmartAccountParameters = Prettify<{
    client: Client<Transport, Chain | undefined, JsonRpcAccount | LocalAccount | undefined>;
    owners: [
        OneOf<EthereumProvider | WalletClient<Transport, Chain | undefined, Account> | LocalAccount>
    ];
    version: "1.0.0";
    address?: Address | undefined;
    entryPoint?: {
        address: Address;
        version: "0.7";
    };
    index?: bigint;
    factoryAddress?: Address;
    validatorAddress?: Address;
    attesters?: Address[];
    threshold?: number;
}>;
export type NexusSmartAccountImplementation = Assign<SmartAccountImplementation<typeof entryPoint07Abi, "0.7">, {
    sign: NonNullable<SmartAccountImplementation["sign"]>;
}>;
export type ToNexusSmartAccountReturnType = Prettify<SmartAccount<NexusSmartAccountImplementation>>;
export declare function toNexusSmartAccount(parameters: ToNexusSmartAccountParameters): Promise<ToNexusSmartAccountReturnType>;
//# sourceMappingURL=toNexusSmartAccount.d.ts.map