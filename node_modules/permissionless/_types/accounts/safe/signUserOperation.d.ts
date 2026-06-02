import { type Account, type Address, type Chain, type Hex, type LocalAccount, type OneOf, type Transport, type UnionPartialBy, type WalletClient } from "viem";
import type { UserOperation, WebAuthnAccount } from "viem/account-abstraction";
import type { EthereumProvider } from "../../utils/toOwner.js";
import { type SafeVersion } from "./toSafeSmartAccount.js";
export declare const concatSignatures: (signatures: {
    signer: Address;
    data: Hex;
    dynamic: boolean;
}[]) => Hex;
export declare const getWebAuthnSignature: ({ owner, hash }: {
    owner: WebAuthnAccount;
    hash: Hex;
}) => Promise<`0x${string}`>;
export declare function signUserOperation(parameters: UnionPartialBy<UserOperation, "sender"> & {
    version: SafeVersion;
    entryPoint: {
        address: Address;
        version: "0.6" | "0.7";
    };
    owners: (Account | WebAuthnAccount)[];
    account: OneOf<EthereumProvider | WalletClient<Transport, Chain | undefined, Account> | LocalAccount | WebAuthnAccount>;
    chainId: number;
    signatures?: Hex;
    validAfter?: number;
    validUntil?: number;
    safe4337ModuleAddress?: Address;
    safeWebAuthnSharedSignerAddress?: Address;
}): Promise<`0x${string}`>;
//# sourceMappingURL=signUserOperation.d.ts.map