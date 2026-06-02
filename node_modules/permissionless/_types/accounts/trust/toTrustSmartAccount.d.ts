import { type Account, type Address, type Assign, type Chain, type Client, type JsonRpcAccount, type LocalAccount, type OneOf, type Transport, type WalletClient } from "viem";
import { type SmartAccount, type SmartAccountImplementation, entryPoint06Abi } from "viem/account-abstraction";
import { type EthereumProvider } from "../../utils/toOwner.js";
/**
 * Default addresses for Trust Smart Account
 */
export declare const TRUST_ADDRESSES: {
    secp256k1VerificationFacetAddress: Address;
    factoryAddress: Address;
};
export type ToTrustSmartAccountParameters = {
    client: Client<Transport, Chain | undefined, JsonRpcAccount | LocalAccount | undefined>;
    owner: OneOf<EthereumProvider | WalletClient<Transport, Chain | undefined, Account> | LocalAccount>;
    factoryAddress?: Address;
    entryPoint: {
        address: Address;
        version: "0.6";
    };
    index?: bigint;
    address?: Address;
    secp256k1VerificationFacetAddress?: Address;
    nonceKey?: bigint;
};
export type TrustSmartAccountImplementation = Assign<SmartAccountImplementation<typeof entryPoint06Abi, "0.6">, {
    sign: NonNullable<SmartAccountImplementation["sign"]>;
}>;
export type ToTrustSmartAccountReturnType = SmartAccount<TrustSmartAccountImplementation>;
/**
 * @description Creates an Trust Smart Account from a private key.
 *
 * @returns A Private Key Trust Smart Account.
 */
export declare function toTrustSmartAccount(parameters: ToTrustSmartAccountParameters): Promise<ToTrustSmartAccountReturnType>;
//# sourceMappingURL=toTrustSmartAccount.d.ts.map