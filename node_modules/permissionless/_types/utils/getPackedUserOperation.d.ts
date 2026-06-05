import { type Hex } from "viem";
import type { PackedUserOperation, UserOperation } from "viem/account-abstraction";
export declare function getInitCode(unpackedUserOperation: UserOperation<"0.7">): `0x${string}`;
export declare function unPackInitCode(initCode: Hex): {
    factory: null;
    factoryData: null;
} | {
    factory: `0x${string}`;
    factoryData: `0x${string}`;
};
export declare function getAccountGasLimits(unpackedUserOperation: UserOperation<"0.7">): `0x${string}`;
export declare function unpackAccountGasLimits(accountGasLimits: Hex): {
    verificationGasLimit: bigint;
    callGasLimit: bigint;
};
export declare function getGasLimits(unpackedUserOperation: UserOperation<"0.7">): `0x${string}`;
export declare function unpackGasLimits(gasLimits: Hex): {
    maxPriorityFeePerGas: bigint;
    maxFeePerGas: bigint;
};
export declare function getPaymasterAndData(unpackedUserOperation: UserOperation<"0.7">): `0x${string}`;
export declare function unpackPaymasterAndData(paymasterAndData: Hex): {
    paymaster: null;
    paymasterVerificationGasLimit: null;
    paymasterPostOpGasLimit: null;
    paymasterData: null;
} | {
    paymaster: `0x${string}`;
    paymasterVerificationGasLimit: bigint;
    paymasterPostOpGasLimit: bigint;
    paymasterData: `0x${string}`;
};
export declare const getPackedUserOperation: (userOperation: UserOperation<"0.7">) => PackedUserOperation;
//# sourceMappingURL=getPackedUserOperation.d.ts.map