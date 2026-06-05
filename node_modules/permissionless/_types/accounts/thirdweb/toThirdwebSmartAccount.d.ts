import type { Account, Address, Assign, Chain, Client, JsonRpcAccount, LocalAccount, OneOf, Transport, WalletClient } from "viem";
import { type SmartAccount, type SmartAccountImplementation, entryPoint06Abi, entryPoint07Abi } from "viem/account-abstraction";
import { type EthereumProvider } from "../../utils/toOwner.js";
/**
 * Default addresses for Thirdweb Smart Account
 */
export declare const THIRDWEB_ADDRESSES: {
    "0.6": {
        "1.5.20": {
            factoryAddress: Address;
        };
    };
    "0.7": {
        "1.5.20": {
            factoryAddress: Address;
        };
    };
};
export type ToThirdwebSmartAccountParameters<entryPointVersion extends "0.6" | "0.7" = "0.7"> = {
    client: Client<Transport, Chain | undefined, JsonRpcAccount | LocalAccount | undefined>;
    owner: OneOf<EthereumProvider | WalletClient<Transport, Chain | undefined, Account> | LocalAccount>;
    factoryAddress?: Address;
    entryPoint?: {
        address: Address;
        version: entryPointVersion;
    };
    version?: "1.5.20";
    salt?: string;
    address?: Address;
    secp256k1VerificationFacetAddress?: Address;
    nonceKey?: bigint;
};
export type ThirdwebSmartAccountImplementation<entryPointVersion extends "0.6" | "0.7" = "0.7"> = Assign<SmartAccountImplementation<entryPointVersion extends "0.6" ? typeof entryPoint06Abi : typeof entryPoint07Abi, entryPointVersion>, {
    sign: NonNullable<SmartAccountImplementation["sign"]>;
}>;
export type ToThirdwebSmartAccountReturnType<entryPointVersion extends "0.6" | "0.7" = "0.7"> = SmartAccount<ThirdwebSmartAccountImplementation<entryPointVersion>>;
/**
 * @description Creates a Thirdweb Smart Account from a private key.
 *
 * @returns A Private Key Thirdweb Smart Account.
 */
export declare function toThirdwebSmartAccount<entryPointVersion extends "0.6" | "0.7" = "0.7">(parameters: ToThirdwebSmartAccountParameters<entryPointVersion>): Promise<ToThirdwebSmartAccountReturnType<entryPointVersion>>;
//# sourceMappingURL=toThirdwebSmartAccount.d.ts.map