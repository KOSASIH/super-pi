import { type Account, type Address, type Assign, type Chain, type Client, type EIP1193Provider, type JsonRpcAccount, type LocalAccount, type OneOf, type Transport, type WalletClient } from "viem";
import { type SmartAccount, type SmartAccountImplementation, entryPoint07Abi } from "viem/account-abstraction";
export type ToEtherspotSmartAccountParameters<entryPointVersion extends "0.6" | "0.7"> = {
    client: Client<Transport, Chain | undefined, JsonRpcAccount | LocalAccount | undefined>;
    owners: [
        OneOf<EIP1193Provider | WalletClient<Transport, Chain | undefined, Account> | LocalAccount>
    ];
    entryPoint?: {
        address: Address;
        version: entryPointVersion;
    };
    address?: Address;
    index?: bigint;
    metaFactoryAddress?: Address;
    validatorAddress?: Address;
    bootstrapAddress?: Address;
    nonceKey?: bigint;
};
export type EtherspotSmartAccountImplementation<entryPointVersion extends "0.7" = "0.7"> = Assign<SmartAccountImplementation<typeof entryPoint07Abi, entryPointVersion>, {
    sign: NonNullable<SmartAccountImplementation["sign"]>;
}>;
export type ToEtherspotSmartAccountReturnType<entryPointVersion extends "0.7" = "0.7"> = SmartAccount<EtherspotSmartAccountImplementation<entryPointVersion>>;
export declare function toEtherspotSmartAccount<entryPointVersion extends "0.7">(parameters: ToEtherspotSmartAccountParameters<entryPointVersion>): Promise<ToEtherspotSmartAccountReturnType<entryPointVersion>>;
//# sourceMappingURL=toEtherspotSmartAccount.d.ts.map