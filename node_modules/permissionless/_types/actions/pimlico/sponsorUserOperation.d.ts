import type { Account, Address, Chain, Client, Hex, OneOf, PartialBy, Transport } from "viem";
import type { EntryPointVersion, UserOperation } from "viem/account-abstraction";
import type { PimlicoRpcSchema } from "../../types/pimlico.js";
type PaymasterContext = {
    sponsorshipPolicyId?: string;
    validForSeconds?: number;
    meta?: Record<string, string>;
    [key: string]: unknown;
};
export type PimlicoSponsorUserOperationParameters<entryPointVersion extends EntryPointVersion> = {
    userOperation: OneOf<(entryPointVersion extends "0.6" ? PartialBy<UserOperation<"0.6">, "callGasLimit" | "preVerificationGas" | "verificationGasLimit"> : never) | (entryPointVersion extends "0.7" ? PartialBy<UserOperation<"0.7">, "callGasLimit" | "preVerificationGas" | "verificationGasLimit" | "paymasterVerificationGasLimit" | "paymasterPostOpGasLimit"> : never)>;
    entryPoint: {
        address: Address;
        version: entryPointVersion;
    };
    sponsorshipPolicyId?: string;
    paymasterContext?: PaymasterContext | unknown;
};
export type SponsorUserOperationReturnType<entryPointVersion extends EntryPointVersion = "0.7"> = OneOf<(entryPointVersion extends "0.6" ? {
    callGasLimit: bigint;
    verificationGasLimit: bigint;
    preVerificationGas: bigint;
    paymasterAndData: Hex;
} : never) | (entryPointVersion extends "0.7" ? {
    callGasLimit: bigint;
    verificationGasLimit: bigint;
    preVerificationGas: bigint;
    paymaster: Address;
    paymasterVerificationGasLimit: bigint;
    paymasterPostOpGasLimit: bigint;
    paymasterData: Hex;
} : never)>;
export declare const sponsorUserOperation: <entryPointVersion extends EntryPointVersion = EntryPointVersion>(client: Client<Transport, Chain | undefined, Account | undefined, PimlicoRpcSchema<entryPointVersion>>, args: PimlicoSponsorUserOperationParameters<entryPointVersion>) => Promise<SponsorUserOperationReturnType<entryPointVersion>>;
export {};
//# sourceMappingURL=sponsorUserOperation.d.ts.map