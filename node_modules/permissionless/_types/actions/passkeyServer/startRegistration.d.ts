import type { Account, Chain, Client, Transport } from "viem";
import type { CreateWebAuthnCredentialParameters } from "viem/account-abstraction";
import type { PasskeyServerRpcSchema } from "../../types/passkeyServer.js";
export type StartRegistrationParameters = {
    context?: Record<string, unknown>;
};
export type StartRegistrationReturnType = CreateWebAuthnCredentialParameters;
export declare const startRegistration: (client: Client<Transport, Chain | undefined, Account | undefined, PasskeyServerRpcSchema>, args?: StartRegistrationParameters) => Promise<StartRegistrationReturnType>;
//# sourceMappingURL=startRegistration.d.ts.map