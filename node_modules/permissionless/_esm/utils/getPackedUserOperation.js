import { concat, getAddress, pad, slice, toHex } from "viem";
export function getInitCode(unpackedUserOperation) {
    return unpackedUserOperation.factory
        ? concat([
            unpackedUserOperation.factory,
            unpackedUserOperation.factoryData || "0x"
        ])
        : "0x";
}
export function unPackInitCode(initCode) {
    if (initCode === "0x") {
        return {
            factory: null,
            factoryData: null
        };
    }
    return {
        factory: getAddress(slice(initCode, 0, 20)),
        factoryData: slice(initCode, 20)
    };
}
export function getAccountGasLimits(unpackedUserOperation) {
    return concat([
        pad(toHex(unpackedUserOperation.verificationGasLimit), {
            size: 16
        }),
        pad(toHex(unpackedUserOperation.callGasLimit), { size: 16 })
    ]);
}
export function unpackAccountGasLimits(accountGasLimits) {
    return {
        verificationGasLimit: BigInt(slice(accountGasLimits, 0, 16)),
        callGasLimit: BigInt(slice(accountGasLimits, 16))
    };
}
export function getGasLimits(unpackedUserOperation) {
    return concat([
        pad(toHex(unpackedUserOperation.maxPriorityFeePerGas), {
            size: 16
        }),
        pad(toHex(unpackedUserOperation.maxFeePerGas), { size: 16 })
    ]);
}
export function unpackGasLimits(gasLimits) {
    return {
        maxPriorityFeePerGas: BigInt(slice(gasLimits, 0, 16)),
        maxFeePerGas: BigInt(slice(gasLimits, 16))
    };
}
export function getPaymasterAndData(unpackedUserOperation) {
    return unpackedUserOperation.paymaster
        ? concat([
            unpackedUserOperation.paymaster,
            pad(toHex(unpackedUserOperation.paymasterVerificationGasLimit ||
                BigInt(0)), {
                size: 16
            }),
            pad(toHex(unpackedUserOperation.paymasterPostOpGasLimit || BigInt(0)), {
                size: 16
            }),
            unpackedUserOperation.paymasterData || "0x"
        ])
        : "0x";
}
export function unpackPaymasterAndData(paymasterAndData) {
    if (paymasterAndData === "0x") {
        return {
            paymaster: null,
            paymasterVerificationGasLimit: null,
            paymasterPostOpGasLimit: null,
            paymasterData: null
        };
    }
    return {
        paymaster: getAddress(slice(paymasterAndData, 0, 20)),
        paymasterVerificationGasLimit: BigInt(slice(paymasterAndData, 20, 36)),
        paymasterPostOpGasLimit: BigInt(slice(paymasterAndData, 36, 52)),
        paymasterData: slice(paymasterAndData, 52)
    };
}
export const getPackedUserOperation = (userOperation) => {
    return {
        sender: userOperation.sender,
        nonce: userOperation.nonce,
        initCode: getInitCode(userOperation),
        callData: userOperation.callData,
        accountGasLimits: getAccountGasLimits(userOperation),
        preVerificationGas: userOperation.preVerificationGas,
        gasFees: getGasLimits(userOperation),
        paymasterAndData: getPaymasterAndData(userOperation),
        signature: userOperation.signature
    };
};
//# sourceMappingURL=getPackedUserOperation.js.map