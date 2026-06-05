import type { Account, Chain, Client, Hex, Transport } from "viem";
import type { PasskeyServerRpcSchema } from "../../types/passkeyServer.js";
export type GetCredentialsParameters = {
    context?: Record<string, unknown>;
};
export type GetCredentialsReturnType = {
    id: string;
    publicKey: Hex;
}[];
export declare const getCredentials: (client: Client<Transport, Chain | undefined, Account | undefined, PasskeyServerRpcSchema>, args?: GetCredentialsParameters) => Promise<GetCredentialsReturnType>;
//# sourceMappingURL=getCredentials.d.ts.map