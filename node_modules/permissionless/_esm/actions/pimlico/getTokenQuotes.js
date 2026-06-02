import { ChainNotFoundError, hexToBigInt, numberToHex } from "viem";
/**
 * Returns all related fields to calculate the potential cost of a userOperation in ERC-20 tokens.
 *
 * - Docs: https://docs.pimlico.io/permissionless/reference/pimlico-bundler-actions/getTokenQuotes
 *
 * @param client that you created using viem's createClient whose transport url is pointing to the Pimlico's bundler.
 * @returns slow, standard & fast values for maxFeePerGas & maxPriorityFeePerGas
 * @returns quotes, see {@link GetTokenQuotesReturnType}
 *
 */
export const getTokenQuotes = async (client, args) => {
    const chainId = args.chain?.id ?? client.chain?.id;
    if (!chainId) {
        throw new ChainNotFoundError();
    }
    const res = await client.request({
        method: "pimlico_getTokenQuotes",
        params: [
            { tokens: args.tokens },
            args.entryPointAddress,
            numberToHex(chainId)
        ]
    });
    return res.quotes.map((quote) => ({
        ...quote,
        balanceSlot: quote.balanceSlot
            ? hexToBigInt(quote.balanceSlot)
            : undefined,
        allowanceSlot: quote.allowanceSlot
            ? hexToBigInt(quote.allowanceSlot)
            : undefined,
        postOpGas: hexToBigInt(quote.postOpGas),
        exchangeRate: hexToBigInt(quote.exchangeRate),
        exchangeRateNativeToUsd: hexToBigInt(quote.exchangeRateNativeToUsd)
    }));
};
//# sourceMappingURL=getTokenQuotes.js.map