"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.estimateErc20PaymasterCost = void 0;
const viem_1 = require("viem");
const utils_1 = require("viem/utils");
const getRequiredPrefund_js_1 = require("../../utils/getRequiredPrefund.js");
const getTokenQuotes_js_1 = require("./getTokenQuotes.js");
const estimateErc20PaymasterCost = async (client, args) => {
    const chain = args.chain ?? client.chain;
    if (!chain) {
        throw new viem_1.ChainNotFoundError();
    }
    const { entryPoint, userOperation, token } = args;
    const quotes = await (0, utils_1.getAction)(client, getTokenQuotes_js_1.getTokenQuotes, "getTokenQuotes")({
        tokens: [token],
        entryPointAddress: entryPoint.address,
        chain
    });
    const postOpGas = quotes[0].postOpGas;
    const exchangeRate = quotes[0].exchangeRate;
    const exchangeRateNativeToUsd = quotes[0].exchangeRateNativeToUsd;
    const userOperationMaxCost = (0, getRequiredPrefund_js_1.getRequiredPrefund)({
        userOperation,
        entryPointVersion: entryPoint.version
    });
    const maxCostInWei = userOperationMaxCost + postOpGas * userOperation.maxFeePerGas;
    const costInToken = (maxCostInWei * exchangeRate) / BigInt(1e18);
    const costInUsd = (maxCostInWei * exchangeRateNativeToUsd) / 10n ** 18n;
    return {
        costInToken,
        costInUsd
    };
};
exports.estimateErc20PaymasterCost = estimateErc20PaymasterCost;
//# sourceMappingURL=estimateErc20PaymasterCost.js.map