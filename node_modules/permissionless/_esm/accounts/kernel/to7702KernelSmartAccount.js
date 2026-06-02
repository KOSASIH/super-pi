import { toKernelSmartAccount } from "./toKernelSmartAccount.js";
export async function to7702KernelSmartAccount(parameters) {
    return toKernelSmartAccount({
        ...parameters,
        eip7702: true
    });
}
//# sourceMappingURL=to7702KernelSmartAccount.js.map