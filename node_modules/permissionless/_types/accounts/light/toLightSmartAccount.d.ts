import { type Account, type Address, type Assign, type Chain, type Client, type JsonRpcAccount, type LocalAccount, type OneOf, type Transport, type WalletClient } from "viem";
import { type SmartAccount, type SmartAccountImplementation, entryPoint06Abi, entryPoint07Abi } from "viem/account-abstraction";
import { type EthereumProvider } from "../../utils/toOwner.js";
export type LightAccountVersion<entryPointVersion extends "0.6" | "0.7"> = entryPointVersion extends "0.6" ? "1.1.0" : "2.0.0";
export type ToLightSmartAccountParameters<entryPointVersion extends "0.6" | "0.7" = "0.7"> = {
    client: Client<Transport, Chain | undefined, JsonRpcAccount | LocalAccount | undefined>;
    entryPoint?: {
        address: Address;
        version: entryPointVersion;
    };
    owner: OneOf<EthereumProvider | WalletClient<Transport, Chain | undefined, Account> | LocalAccount>;
    version: LightAccountVersion<entryPointVersion>;
    factoryAddress?: Address;
    index?: bigint;
    address?: Address;
    nonceKey?: bigint;
};
export type LightSmartAccountImplementation<entryPointVersion extends "0.6" | "0.7"> = Assign<SmartAccountImplementation<entryPointVersion extends "0.6" ? typeof entryPoint06Abi : typeof entryPoint07Abi, entryPointVersion>, {
    sign: NonNullable<SmartAccountImplementation["sign"]>;
}>;
export type ToLightSmartAccountReturnType<entryPointVersion extends "0.6" | "0.7" = "0.7"> = SmartAccount<LightSmartAccountImplementation<entryPointVersion>>;
/**
 * @description Creates an Light Account from a private key.
 *
 * @returns A Private Key Light Account.
 */
export declare function toLightSmartAccount<entryPointVersion extends "0.6" | "0.7" = "0.7">(parameters: ToLightSmartAccountParameters<entryPointVersion>): Promise<ToLightSmartAccountReturnType<entryPointVersion>>;
//# sourceMappingURL=toLightSmartAccount.d.ts.map