import { type BundlerRpcSchema, type Chain, type Client, type ClientConfig, type EstimateFeesPerGasReturnType, type Prettify, type RpcSchema, type Transport } from "viem";
import { type BundlerActions, type BundlerClientConfig, type PaymasterActions, type SmartAccount, type UserOperationRequest, type prepareUserOperation as viemPrepareUserOperation } from "viem/account-abstraction";
import { type SmartAccountActions } from "./decorators/smartAccount.js";
/**
 * TODO:
 *  - Add docs
 *  - Fix typing, 'accounts' is required to signMessage, signTypedData, signTransaction, but not needed here, since account is embedded in the client
 */
export type SmartAccountClient<transport extends Transport = Transport, chain extends Chain | undefined = Chain | undefined, account extends SmartAccount | undefined = SmartAccount | undefined, client extends Client | undefined = Client | undefined, rpcSchema extends RpcSchema | undefined = undefined> = Prettify<Client<transport, chain extends Chain ? chain : client extends Client<any, infer chain> ? chain : undefined, account, rpcSchema extends RpcSchema ? [...BundlerRpcSchema, ...rpcSchema] : BundlerRpcSchema, BundlerActions<account> & SmartAccountActions<chain, account>>> & {
    client: client;
    paymaster: BundlerClientConfig["paymaster"] | undefined;
    paymasterContext: BundlerClientConfig["paymasterContext"] | undefined;
    userOperation: BundlerClientConfig["userOperation"] | undefined;
};
export type SmartAccountClientConfig<transport extends Transport = Transport, chain extends Chain | undefined = Chain | undefined, account extends SmartAccount | undefined = SmartAccount | undefined, client extends Client | undefined = Client | undefined, rpcSchema extends RpcSchema | undefined = undefined> = Prettify<Pick<ClientConfig<transport, chain, account, rpcSchema>, "account" | "cacheTime" | "chain" | "key" | "name" | "pollingInterval" | "rpcSchema">> & {
    bundlerTransport: transport;
    /** Client that points to an Execution RPC URL. */
    client?: client | Client | undefined;
    /** Paymaster configuration. */
    paymaster?: true | {
        /** Retrieves paymaster-related User Operation properties to be used for sending the User Operation. */
        getPaymasterData?: PaymasterActions["getPaymasterData"] | undefined;
        /** Retrieves paymaster-related User Operation properties to be used for gas estimation. */
        getPaymasterStubData?: PaymasterActions["getPaymasterStubData"] | undefined;
    } | undefined;
    /** Paymaster context to pass to `getPaymasterData` and `getPaymasterStubData` calls. */
    paymasterContext?: unknown;
    /** User Operation configuration. */
    userOperation?: {
        /** Prepares fee properties for the User Operation request. */
        estimateFeesPerGas?: ((parameters: {
            account: account | SmartAccount;
            bundlerClient: Client;
            userOperation: UserOperationRequest;
        }) => Promise<EstimateFeesPerGasReturnType<"eip1559">>) | undefined;
        /** Prepare User Operation configuration. */
        prepareUserOperation?: typeof viemPrepareUserOperation | undefined;
    } | undefined;
};
export declare function createSmartAccountClient<transport extends Transport, chain extends Chain | undefined = undefined, account extends SmartAccount | undefined = undefined, client extends Client | undefined = undefined, rpcSchema extends RpcSchema | undefined = undefined>(parameters: SmartAccountClientConfig<transport, chain, account, client, rpcSchema>): SmartAccountClient<transport, chain, account, client, rpcSchema>;
//# sourceMappingURL=createSmartAccountClient.d.ts.map