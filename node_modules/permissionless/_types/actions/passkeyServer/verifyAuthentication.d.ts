import { type WebAuthnP256 } from "ox";
import type { Account, Chain, Client, Hex, Transport } from "viem";
import type { PasskeyServerRpcSchema } from "../../types/passkeyServer.js";
export type VerifyAuthenticationParameters = WebAuthnP256.sign.ReturnType & {
    uuid: string;
};
export type VerifyAuthenticationReturnType = {
    success: boolean;
    id: string;
    publicKey: Hex;
    userName: string;
};
export declare const verifyAuthentication: (client: Client<Transport, Chain | undefined, Account | undefined, PasskeyServerRpcSchema>, args: VerifyAuthenticationParameters) => Promise<VerifyAuthenticationReturnType>;
//# sourceMappingURL=verifyAuthentication.d.ts.map