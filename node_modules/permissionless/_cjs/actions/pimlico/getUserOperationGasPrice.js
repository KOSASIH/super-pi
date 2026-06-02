"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserOperationGasPrice = void 0;
const getUserOperationGasPrice = async (client) => {
    const gasPrice = await client.request({
        method: "pimlico_getUserOperationGasPrice",
        params: []
    });
    return {
        slow: {
            maxFeePerGas: BigInt(gasPrice.slow.maxFeePerGas),
            maxPriorityFeePerGas: BigInt(gasPrice.slow.maxPriorityFeePerGas)
        },
        standard: {
            maxFeePerGas: BigInt(gasPrice.standard.maxFeePerGas),
            maxPriorityFeePerGas: BigInt(gasPrice.standard.maxPriorityFeePerGas)
        },
        fast: {
            maxFeePerGas: BigInt(gasPrice.fast.maxFeePerGas),
            maxPriorityFeePerGas: BigInt(gasPrice.fast.maxPriorityFeePerGas)
        }
    };
};
exports.getUserOperationGasPrice = getUserOperationGasPrice;
//# sourceMappingURL=getUserOperationGasPrice.js.map