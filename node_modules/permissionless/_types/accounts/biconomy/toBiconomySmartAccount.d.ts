import type { Account, Assign, Chain, JsonRpcAccount, OneOf, Prettify, Transport, WalletClient } from "viem";
import { type Address, type Client, type LocalAccount } from "viem";
import { type SmartAccount, type SmartAccountImplementation, entryPoint06Abi } from "viem/account-abstraction";
import { type EthereumProvider } from "../../utils/toOwner.js";
export type ToBiconomySmartAccountParameters = Prettify<{
    client: Client<Transport, Chain | undefined, JsonRpcAccount | LocalAccount | undefined>;
    owners: [
        OneOf<EthereumProvider | WalletClient<Transport, Chain | undefined, Account> | LocalAccount>
    ];
    address?: Address | undefined;
    entryPoint: {
        address: Address;
        version: "0.6";
    };
    nonceKey?: bigint;
    index?: bigint;
    factoryAddress?: Address;
    ecdsaModuleAddress?: Address;
    accountLogicAddress?: Address;
    fallbackHandlerAddress?: Address;
}>;
export type BiconomySmartAccountImplementation = Assign<SmartAccountImplementation<typeof entryPoint06Abi, "0.6">, {
    sign: NonNullable<SmartAccountImplementation["sign"]>;
}>;
export type ToBiconomySmartAccountReturnType = Prettify<SmartAccount<BiconomySmartAccountImplementation>>;
/**
 * @deprecated Biconomy Smart Account is deprecated. Please use toNexusSmartAccount instead.
 * @see toNexusSmartAccount
 */
export declare function toBiconomySmartAccount(parameters: ToBiconomySmartAccountParameters): Promise<ToBiconomySmartAccountReturnType>;
//# sourceMappingURL=toBiconomySmartAccount.d.ts.map