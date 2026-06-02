import { type LocalAccount, type SignTypedDataReturnType, type TypedDataDefinition } from "viem";
import type { WebAuthnAccount } from "viem/account-abstraction";
import { type WrapMessageHashParams } from "./wrapMessageHash.js";
export declare function signTypedData(parameters: TypedDataDefinition & WrapMessageHashParams & {
    owner: LocalAccount | WebAuthnAccount;
    eip7702: boolean;
}): Promise<SignTypedDataReturnType>;
//# sourceMappingURL=signTypedData.d.ts.map