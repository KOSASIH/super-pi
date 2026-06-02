import { type Account, type Address, type Chain, type Client, type GetChainParameter, type Transport } from "viem";
import type { EntryPointVersion, UserOperation } from "viem/account-abstraction";
import type { PimlicoRpcSchema } from "../../types/pimlico.js";
/**
 * @costInToken represents the max amount of token that will be charged for this user operation in token decimals
 * @costInUsd represents the max amount of USD value of the token in 10^6 decimals
 */
export type EstimateErc20PaymasterCostReturnType = {
    costInToken: bigint;
    costInUsd: bigint;
};
export type EstimateErc20PaymasterCostParameters<entryPointVersion extends EntryPointVersion, TChain extends Chain | undefined, TChainOverride extends Chain | undefined = Chain | undefined> = {
    entryPoint: {
        version: entryPointVersion;
        address: Address;
    };
    userOperation: UserOperation<entryPointVersion>;
    token: Address;
} & GetChainParameter<TChain, TChainOverride>;
/**
 * Returns all related fields to calculate the potential cost of a userOperation in ERC-20 tokens.
 *
 * - Docs: https://docs.pimlico.io/permissionless/reference/pimlico-bundler-actions/EstimateErc20PaymasterCost
 *
 * @param client that you created using viem's createClient whose transport url is pointing to the Pimlico's bundler.
 * @returns quotes, see {@link EstimateErc20PaymasterCostReturnType}
 *
 */
export declare const estimateErc20PaymasterCost: <entryPointVersion extends EntryPointVersion, TChain extends Chain | undefined, TChainOverride extends Chain | undefined = Chain | undefined>(client: Client<Transport, TChain, Account | undefined, PimlicoRpcSchema<entryPointVersion>>, args: EstimateErc20PaymasterCostParameters<entryPointVersion, TChain, TChainOverride>) => Promise<EstimateErc20PaymasterCostReturnType>;
//# sourceMappingURL=estimateErc20PaymasterCost.d.ts.map