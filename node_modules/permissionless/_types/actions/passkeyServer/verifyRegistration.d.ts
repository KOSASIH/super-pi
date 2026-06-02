import type { Account, Chain, Client, Hex, Transport } from "viem";
import type { CreateWebAuthnCredentialReturnType } from "viem/account-abstraction";
import type { PasskeyServerRpcSchema } from "../../types/passkeyServer.js";
export type VerifyRegistrationParameters = {
    credential: CreateWebAuthnCredentialReturnType;
    context: unknown;
};
export type VerifyRegistrationReturnType = {
    success: boolean;
    id: string;
    publicKey: Hex;
    userName: string;
};
export declare const verifyRegistration: (client: Client<Transport, Chain | undefined, Account | undefined, PasskeyServerRpcSchema>, args: VerifyRegistrationParameters) => Promise<VerifyRegistrationReturnType>;
//# sourceMappingURL=verifyRegistration.d.ts.map