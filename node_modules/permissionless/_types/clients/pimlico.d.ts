import type { Address, BundlerRpcSchema, Chain, Client, ClientConfig, Prettify, RpcSchema, Transport } from "viem";
import { type BundlerActions, type EntryPointVersion, type PaymasterActions, type SmartAccount } from "viem/account-abstraction";
import type { PimlicoRpcSchema } from "../types/pimlico.js";
import { type PimlicoActions } from "./decorators/pimlico.js";
export type PimlicoClient<entryPointVersion extends EntryPointVersion = EntryPointVersion, transport extends Transport = Transport, chain extends Chain | undefined = Chain | undefined, account extends SmartAccount | undefined = SmartAccount | undefined, client extends Client | undefined = Client | undefined, rpcSchema extends RpcSchema | undefined = undefined> = Prettify<Client<transport, chain extends Chain ? chain : client extends Client<any, infer chain> ? chain : undefined, account, rpcSchema extends RpcSchema ? [...BundlerRpcSchema, ...PimlicoRpcSchema, ...rpcSchema] : [...BundlerRpcSchema, ...PimlicoRpcSchema], BundlerActions<account> & PaymasterActions & PimlicoActions<chain, entryPointVersion>>>;
export type PimlicoClientConfig<entryPointVersion extends EntryPointVersion = EntryPointVersion, transport extends Transport = Transport, chain extends Chain | undefined = Chain | undefined, account extends SmartAccount | undefined = SmartAccount | undefined, rpcSchema extends RpcSchema | undefined = undefined> = Prettify<Pick<ClientConfig<transport, chain, account, rpcSchema>, "account" | "cacheTime" | "chain" | "key" | "name" | "pollingInterval" | "rpcSchema" | "transport">> & {
    entryPoint?: {
        address: Address;
        version: entryPointVersion;
    };
};
export declare function createPimlicoClient<entryPointVersion extends EntryPointVersion = "0.7", transport extends Transport = Transport, chain extends Chain | undefined = undefined, account extends SmartAccount | undefined = SmartAccount | undefined, client extends Client | undefined = undefined, rpcSchema extends RpcSchema | undefined = undefined>(parameters: PimlicoClientConfig<entryPointVersion, transport, chain, account, rpcSchema>): PimlicoClient<entryPointVersion, transport, chain, account, client, rpcSchema>;
//# sourceMappingURL=pimlico.d.ts.map