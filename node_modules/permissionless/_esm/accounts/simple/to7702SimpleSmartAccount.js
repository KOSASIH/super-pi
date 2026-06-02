import { toSimpleSmartAccount } from "./toSimpleSmartAccount.js";
export async function to7702SimpleSmartAccount(parameters) {
    return toSimpleSmartAccount({
        ...parameters,
        eip7702: true
    });
}
//# sourceMappingURL=to7702SimpleSmartAccount.js.map