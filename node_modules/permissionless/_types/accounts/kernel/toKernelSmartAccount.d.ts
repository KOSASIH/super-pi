import type { Account, Assign, Chain, JsonRpcAccount, OneOf, Transport, WalletClient } from "viem";
import { type Address, type Client, type LocalAccount } from "viem";
import { type SmartAccount, type SmartAccountImplementation, type WebAuthnAccount, entryPoint06Abi, entryPoint07Abi } from "viem/account-abstraction";
import { type EthereumProvider } from "../../utils/toOwner.js";
type EntryPointVersion = "0.6" | "0.7";
export type KernelVersion<entryPointVersion extends EntryPointVersion> = entryPointVersion extends "0.6" ? "0.2.1" | "0.2.2" | "0.2.3" | "0.2.4" : "0.3.0-beta" | "0.3.1" | "0.3.2" | "0.3.3";
/**
 * Default addresses map for different kernel smart account versions
 */
export declare const KERNEL_VERSION_TO_ADDRESSES_MAP: {
    [key in KernelVersion<EntryPointVersion>]: {
        ECDSA_VALIDATOR: Address;
        WEB_AUTHN_VALIDATOR?: Address;
        ACCOUNT_LOGIC: Address;
        FACTORY_ADDRESS: Address;
        META_FACTORY_ADDRESS?: Address;
    };
};
export declare const getEcdsaRootIdentifierForKernelV3: (validatorAddress: Address, eip7702?: boolean) => `0x${string}`;
export type ToKernelSmartAccountParameters<entryPointVersion extends EntryPointVersion, kernelVersion extends KernelVersion<entryPointVersion>, owner extends OneOf<EthereumProvider | WalletClient<Transport, Chain | undefined, Account> | LocalAccount | WebAuthnAccount>, eip7702 extends boolean = false> = {
    client: Client<Transport, Chain | undefined, JsonRpcAccount | LocalAccount | undefined>;
    version?: kernelVersion;
    eip7702?: eip7702;
} & (eip7702 extends true ? {
    owner: OneOf<EthereumProvider | WalletClient<Transport, Chain | undefined, Account> | LocalAccount>;
    entryPoint?: {
        address: Address;
        version: "0.7";
    };
    address?: never;
    index?: never;
    factoryAddress?: never;
    metaFactoryAddress?: never;
    accountLogicAddress?: Address;
    validatorAddress?: never;
    nonceKey?: never;
    useMetaFactory?: never;
} : {
    entryPoint?: {
        address: Address;
        version: entryPointVersion;
    };
    owners: [owner];
    address?: Address;
    index?: bigint;
    factoryAddress?: Address;
    metaFactoryAddress?: Address;
    accountLogicAddress?: Address;
    validatorAddress?: Address;
    nonceKey?: bigint;
    useMetaFactory?: boolean | "optional";
});
export type KernelSmartAccountImplementation<entryPointVersion extends EntryPointVersion = "0.7", eip7702 extends boolean = false> = Assign<SmartAccountImplementation<entryPointVersion extends "0.6" ? typeof entryPoint06Abi : typeof entryPoint07Abi, entryPointVersion, eip7702 extends true ? {
    implementation: Address;
} : object, eip7702>, {
    sign: NonNullable<SmartAccountImplementation["sign"]>;
}>;
export type ToKernelSmartAccountReturnType<entryPointVersion extends EntryPointVersion = "0.7", eip7702 extends boolean = false> = eip7702 extends true ? SmartAccount<KernelSmartAccountImplementation<entryPointVersion, true>> : SmartAccount<KernelSmartAccountImplementation<entryPointVersion, false>>;
/**
 * Build a kernel smart account from a private key, that use the ECDSA or passkeys signer behind the scene
 * @param client
 * @param privateKey
 * @param entryPoint
 * @param index
 * @param factoryAddress
 * @param accountLogicAddress
 * @param validatorAddress
 */
export declare function toKernelSmartAccount<entryPointVersion extends EntryPointVersion, kernelVersion extends KernelVersion<entryPointVersion>, owner extends OneOf<EthereumProvider | WalletClient<Transport, Chain | undefined, Account> | LocalAccount | WebAuthnAccount>, eip7702 extends boolean = false>(parameters: ToKernelSmartAccountParameters<entryPointVersion, kernelVersion, owner, eip7702>): Promise<ToKernelSmartAccountReturnType<entryPointVersion, eip7702>>;
export {};
//# sourceMappingURL=toKernelSmartAccount.d.ts.map