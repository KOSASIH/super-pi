import { ChainNotFoundError } from "viem";
import { getAction } from "viem/utils";
import { getRequiredPrefund } from "../../utils/getRequiredPrefund.js";
import { getTokenQuotes } from "./getTokenQuotes.js";
/**
 * Returns all related fields to calculate the potential cost of a userOperation in ERC-20 tokens.
 *
 * - Docs: https://docs.pimlico.io/permissionless/reference/pimlico-bundler-actions/EstimateErc20PaymasterCost
 *
 * @param client that you created using viem's createClient whose transport url is pointing to the Pimlico's bundler.
 * @returns quotes, see {@link EstimateErc20PaymasterCostReturnType}
 *
 */
export const estimateErc20PaymasterCost = async (client, args) => {
    const chain = args.chain ?? client.chain;
    if (!chain) {
        throw new ChainNotFoundError();
    }
    const { entryPoint, userOperation, token } = args;
    const quotes = await getAction(client, getTokenQuotes, "getTokenQuotes")({
        tokens: [token],
        entryPointAddress: entryPoint.address,
        chain
    });
    const postOpGas = quotes[0].postOpGas;
    const exchangeRate = quotes[0].exchangeRate;
    const exchangeRateNativeToUsd = quotes[0].exchangeRateNativeToUsd;
    const userOperationMaxCost = getRequiredPrefund({
        userOperation,
        entryPointVersion: entryPoint.version
    });
    // represents the userOperation's max cost in denomination of wei
    const maxCostInWei = userOperationMaxCost + postOpGas * userOperation.maxFeePerGas;
    // represents the userOperation's max cost in token denomination (wei)
    const costInToken = (maxCostInWei * exchangeRate) / BigInt(1e18);
    // represents the userOperation's max cost in usd (with 6 decimals of precision)
    const costInUsd = (maxCostInWei * exchangeRateNativeToUsd) / 10n ** 18n;
    return {
        costInToken,
        costInUsd
    };
};
//# sourceMappingURL=estimateErc20PaymasterCost.js.map