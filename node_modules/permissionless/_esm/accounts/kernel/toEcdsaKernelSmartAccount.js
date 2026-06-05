import { toKernelSmartAccount } from "./toKernelSmartAccount.js";
/**
 * @deprecated ECDSA Kernel Smart Account is deprecated. Please use toKernelSmartAccount instead.
 * @see toKernelSmartAccount
 */
export async function toEcdsaKernelSmartAccount(parameters) {
    return toKernelSmartAccount({
        ...parameters,
        validatorAddress: parameters.validatorAddress ?? parameters.ecdsaValidatorAddress
    });
}
//# sourceMappingURL=toEcdsaKernelSmartAccount.js.map