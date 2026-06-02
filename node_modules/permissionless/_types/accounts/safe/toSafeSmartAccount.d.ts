import { type Account, type Address, type Assign, type Chain, type Client, type Hex, type JsonRpcAccount, type LocalAccount, type Transport, type WalletClient } from "viem";
import { type SmartAccount, type SmartAccountImplementation, type UserOperation, type WebAuthnAccount, entryPoint06Abi, entryPoint07Abi } from "viem/account-abstraction";
import { type EthereumProvider } from "../../utils/toOwner.js";
export type SafeVersion = "1.4.1" | "1.5.0";
export declare const EIP712_SAFE_OPERATION_TYPE_V06: {
    SafeOp: {
        type: string;
        name: string;
    }[];
};
export declare const EIP712_SAFE_OPERATION_TYPE_V07: {
    SafeOp: {
        type: string;
        name: string;
    }[];
};
export declare const isWebAuthnAccount: (owner: RegularOwner | WebAuthnAccount) => owner is WebAuthnAccount;
export declare function getPaymasterAndData(unpackedUserOperation: UserOperation): `0x${string}`;
export declare const getDefaultAddresses: (safeVersion: SafeVersion, entryPointVersion: "0.6" | "0.7", { addModuleLibAddress: _addModuleLibAddress, safeModuleSetupAddress: _safeModuleSetupAddress, safe4337ModuleAddress: _safe4337ModuleAddress, safeProxyFactoryAddress: _safeProxyFactoryAddress, safeSingletonAddress: _safeSingletonAddress, multiSendAddress: _multiSendAddress, multiSendCallOnlyAddress: _multiSendCallOnlyAddress, safeWebAuthnSharedSignerAddress: _safeWebAuthnSharedSignerAddress, safeP256VerifierAddress: _safeP256VerifierAddress }: {
    addModuleLibAddress?: Address;
    safeModuleSetupAddress?: Address;
    safe4337ModuleAddress?: Address;
    safeProxyFactoryAddress?: Address;
    safeSingletonAddress?: Address;
    multiSendAddress?: Address;
    multiSendCallOnlyAddress?: Address;
    safeWebAuthnSharedSignerAddress?: Address;
    safeP256VerifierAddress?: Address;
}) => {
    safeModuleSetupAddress: `0x${string}`;
    safe4337ModuleAddress: `0x${string}`;
    safeProxyFactoryAddress: `0x${string}`;
    safeSingletonAddress: `0x${string}`;
    multiSendAddress: `0x${string}`;
    multiSendCallOnlyAddress: `0x${string}`;
    safeWebAuthnSharedSignerAddress: `0x${string}` | undefined;
    safeP256VerifierAddress: `0x${string}` | undefined;
};
type GetErc7579Params<TErc7579 extends Address | undefined> = TErc7579 extends undefined ? {
    safeModuleSetupAddress?: Address;
    multiSendAddress?: Address;
    multiSendCallOnlyAddress?: Address;
    setupTransactions?: {
        to: Address;
        data: Address;
        value: bigint;
    }[];
    safeModules?: Address[];
} : {
    validators?: {
        address: Address;
        context: Address;
    }[];
    executors?: {
        address: Address;
        context: Address;
    }[];
    fallbacks?: {
        address: Address;
        context: Address;
    }[];
    hooks?: {
        address: Address;
        context: Address;
    }[];
    attesters?: Address[];
    attestersThreshold?: number;
};
type RegularOwner = Account | WalletClient<Transport, Chain | undefined, Account> | EthereumProvider;
type ValidateAtMostOneWebAuthn<T extends readonly unknown[], SeenWebAuthn extends boolean = false> = T extends readonly [] ? true : T extends readonly [infer H, ...infer Rest] ? H extends WebAuthnAccount ? SeenWebAuthn extends true ? false : ValidateAtMostOneWebAuthn<Rest, true> : H extends RegularOwner ? ValidateAtMostOneWebAuthn<Rest, SeenWebAuthn> : false : true;
type OwnersArray<T extends readonly (RegularOwner | WebAuthnAccount)[]> = ValidateAtMostOneWebAuthn<T> extends true ? T : never;
export type ToSafeSmartAccountParameters<entryPointVersion extends "0.6" | "0.7", TErc7579 extends Address | undefined> = {
    client: Client<Transport, Chain | undefined, JsonRpcAccount | LocalAccount | undefined>;
    owners: OwnersArray<readonly (RegularOwner | WebAuthnAccount)[]>;
    threshold?: bigint;
    version: SafeVersion;
    entryPoint?: {
        address: Address;
        version: entryPointVersion;
    };
    safe4337ModuleAddress?: Address;
    erc7579LaunchpadAddress?: TErc7579;
    safeProxyFactoryAddress?: Address;
    safeSingletonAddress?: Address;
    safeWebAuthnSharedSignerAddress?: Address;
    safeP256VerifierAddress?: Address;
    address?: Address;
    saltNonce?: bigint;
    validUntil?: number;
    validAfter?: number;
    nonceKey?: bigint;
    paymentToken?: Address;
    payment?: bigint;
    paymentReceiver?: Address;
    onchainIdentifier?: Hex;
} & GetErc7579Params<TErc7579>;
export type SafeSmartAccountImplementation<entryPointVersion extends "0.6" | "0.7" = "0.7"> = Assign<SmartAccountImplementation<entryPointVersion extends "0.6" ? typeof entryPoint06Abi : typeof entryPoint07Abi, entryPointVersion>, {
    sign: NonNullable<SmartAccountImplementation["sign"]>;
}>;
export type ToSafeSmartAccountReturnType<entryPointVersion extends "0.6" | "0.7" = "0.7"> = SmartAccount<SafeSmartAccountImplementation<entryPointVersion>>;
/**
 * @description Creates an Simple Account from a private key.
 *
 * @returns A Private Key Simple Account.
 */
export declare function toSafeSmartAccount<entryPointVersion extends "0.6" | "0.7", TErc7579 extends Address | undefined>(parameters: ToSafeSmartAccountParameters<entryPointVersion, TErc7579>): Promise<ToSafeSmartAccountReturnType<entryPointVersion>>;
export {};
//# sourceMappingURL=toSafeSmartAccount.d.ts.map