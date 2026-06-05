import { deepHexlify } from "../../utils/deepHexlify.js";
export const sponsorUserOperation = async (client, args) => {
    const { sponsorshipPolicyId, paymasterContext, userOperation, entryPoint } = args;
    const finalPaymasterContext = sponsorshipPolicyId !== undefined
        ? {
            ...(paymasterContext ?? {}),
            sponsorshipPolicyId
        }
        : paymasterContext;
    const response = await client.request({
        method: "pm_sponsorUserOperation",
        params: finalPaymasterContext
            ? [
                deepHexlify(userOperation),
                entryPoint.address,
                finalPaymasterContext
            ]
            : [deepHexlify(userOperation), entryPoint.address]
    });
    if (entryPoint.version === "0.6") {
        const responseV06 = response;
        return {
            paymasterAndData: responseV06.paymasterAndData,
            preVerificationGas: BigInt(responseV06.preVerificationGas),
            verificationGasLimit: BigInt(responseV06.verificationGasLimit),
            callGasLimit: BigInt(responseV06.callGasLimit)
        };
    }
    const responseV07 = response;
    return {
        callGasLimit: BigInt(responseV07.callGasLimit),
        verificationGasLimit: BigInt(responseV07.verificationGasLimit),
        preVerificationGas: BigInt(responseV07.preVerificationGas),
        paymaster: responseV07.paymaster,
        paymasterVerificationGasLimit: BigInt(responseV07.paymasterVerificationGasLimit),
        paymasterPostOpGasLimit: BigInt(responseV07.paymasterPostOpGasLimit),
        paymasterData: responseV07.paymasterData
    };
};
//# sourceMappingURL=sponsorUserOperation.js.map