"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTokenQuotes = void 0;
const viem_1 = require("viem");
const getTokenQuotes = async (client, args) => {
    const chainId = args.chain?.id ?? client.chain?.id;
    if (!chainId) {
        throw new viem_1.ChainNotFoundError();
    }
    const res = await client.request({
        method: "pimlico_getTokenQuotes",
        params: [
            { tokens: args.tokens },
            args.entryPointAddress,
            (0, viem_1.numberToHex)(chainId)
        ]
    });
    return res.quotes.map((quote) => ({
        ...quote,
        balanceSlot: quote.balanceSlot
            ? (0, viem_1.hexToBigInt)(quote.balanceSlot)
            : undefined,
        allowanceSlot: quote.allowanceSlot
            ? (0, viem_1.hexToBigInt)(quote.allowanceSlot)
            : undefined,
        postOpGas: (0, viem_1.hexToBigInt)(quote.postOpGas),
        exchangeRate: (0, viem_1.hexToBigInt)(quote.exchangeRate),
        exchangeRateNativeToUsd: (0, viem_1.hexToBigInt)(quote.exchangeRateNativeToUsd)
    }));
};
exports.getTokenQuotes = getTokenQuotes;
//# sourceMappingURL=getTokenQuotes.js.map