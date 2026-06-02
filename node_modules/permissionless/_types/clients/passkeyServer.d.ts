import type { Account, Chain, Client, ClientConfig, Prettify, RpcSchema, Transport } from "viem";
import type { PasskeyServerRpcSchema } from "../types/passkeyServer.js";
import { type PasskeyServerActions } from "./decorators/passkeyServer.js";
export type PasskeyServerClient<rpcSchema extends RpcSchema | undefined = undefined> = Prettify<Client<Transport, Chain | undefined, Account | undefined, rpcSchema extends RpcSchema ? [...PasskeyServerRpcSchema, ...rpcSchema] : [...PasskeyServerRpcSchema], PasskeyServerActions>>;
export type PasskeyServerClientConfig<rpcSchema extends RpcSchema | undefined = undefined> = Prettify<Pick<ClientConfig<Transport, Chain | undefined, Account | undefined, rpcSchema>, "account" | "cacheTime" | "chain" | "key" | "name" | "pollingInterval" | "rpcSchema" | "transport">>;
export declare function createPasskeyServerClient<rpcSchema extends RpcSchema | undefined = undefined>(parameters: PasskeyServerClientConfig<rpcSchema>): PasskeyServerClient<rpcSchema>;
//# sourceMappingURL=passkeyServer.d.ts.map