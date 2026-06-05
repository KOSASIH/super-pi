import type { WebAuthnP256 } from "ox";
import { type Account, type Chain, type Client, type Transport } from "viem";
import type { PasskeyServerRpcSchema } from "../../types/passkeyServer.js";
export type StartAuthenticationReturnType = WebAuthnP256.sign.Options & {
    uuid: string;
};
export declare const startAuthentication: (client: Client<Transport, Chain | undefined, Account | undefined, PasskeyServerRpcSchema>) => Promise<StartAuthenticationReturnType>;
//# sourceMappingURL=startAuthentication.d.ts.map