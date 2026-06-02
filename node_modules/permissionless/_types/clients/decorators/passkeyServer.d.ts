import type { Account, Chain, Client, Transport } from "viem";
import { type GetCredentialsParameters, type GetCredentialsReturnType } from "../../actions/passkeyServer/getCredentials.js";
import { type StartAuthenticationReturnType } from "../../actions/passkeyServer/startAuthentication.js";
import { type StartRegistrationParameters, type StartRegistrationReturnType } from "../../actions/passkeyServer/startRegistration.js";
import { type VerifyAuthenticationParameters, type VerifyAuthenticationReturnType } from "../../actions/passkeyServer/verifyAuthentication.js";
import { type VerifyRegistrationParameters, type VerifyRegistrationReturnType } from "../../actions/passkeyServer/verifyRegistration.js";
import type { PasskeyServerRpcSchema } from "../../types/passkeyServer.js";
export type PasskeyServerActions = {
    startRegistration: (args: StartRegistrationParameters) => Promise<StartRegistrationReturnType>;
    verifyRegistration: (args: VerifyRegistrationParameters) => Promise<VerifyRegistrationReturnType>;
    startAuthentication: () => Promise<StartAuthenticationReturnType>;
    verifyAuthentication: (args: VerifyAuthenticationParameters) => Promise<VerifyAuthenticationReturnType>;
    getCredentials: (args: GetCredentialsParameters) => Promise<GetCredentialsReturnType>;
};
export declare const passkeyServerActions: (client: Client<Transport, Chain | undefined, Account | undefined, PasskeyServerRpcSchema>) => PasskeyServerActions;
//# sourceMappingURL=passkeyServer.d.ts.map