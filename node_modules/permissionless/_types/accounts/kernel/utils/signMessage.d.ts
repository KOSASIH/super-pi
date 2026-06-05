import { type LocalAccount, type SignMessageReturnType, type SignableMessage } from "viem";
import type { WebAuthnAccount } from "viem/account-abstraction";
import { type WrapMessageHashParams } from "./wrapMessageHash.js";
export declare function signMessage({ message, owner, accountAddress, kernelVersion: accountVersion, chainId, eip7702 }: {
    chainId: number;
    message: SignableMessage;
    owner: LocalAccount | WebAuthnAccount;
    eip7702: boolean;
} & WrapMessageHashParams): Promise<SignMessageReturnType>;
//# sourceMappingURL=signMessage.d.ts.map